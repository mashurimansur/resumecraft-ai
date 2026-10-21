/**
 * Lightweight client-side PDF and Document text extractor.
 * Handles LinkedIn's "Save to PDF" files using standard stream decompression & text extraction,
 * with graceful fallbacks.
 */

export async function extractTextFromPdfOrTextFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // If plain text, markdown, or json
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json')) {
    return await file.text();
  }

  // If PDF file
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    return await extractTextFromPdfBuffer(arrayBuffer);
  }

  // Fallback to text reading
  return await file.text();
}

/**
 * Extracts plain text from a PDF ArrayBuffer by parsing FlateDecode / uncompressed text objects.
 * LinkedIn "Save to PDF" generates standard stream objects with Tj, TJ, and text blocks.
 */
export async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const latin1Str = new TextDecoder('latin1').decode(bytes);

  const textChunks: string[] = [];

  // 1. First, search for streams and decompress them if FlateDecode
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(latin1Str)) !== null) {
    const streamContent = match[1];
    let decompressed: string | null = null;

    // Convert latin1 stream to Uint8Array
    const streamBytes = new Uint8Array(streamContent.length);
    for (let i = 0; i < streamContent.length; i++) {
      streamBytes[i] = streamContent.charCodeAt(i);
    }

    // Try decompressing with browser native DecompressionStream (deflate or deflate-raw)
    try {
      if (typeof DecompressionStream !== 'undefined') {
        const stream = new Response(streamBytes).body;
        if (stream) {
          try {
            const ds = new DecompressionStream('deflate');
            const decompressedStream = stream.pipeThrough(ds);
            decompressed = await new Response(decompressedStream).text();
          } catch {
            // Try deflate-raw if zlib header is skipped
            const streamRaw = new Response(streamBytes).body;
            if (streamRaw) {
              const dsRaw = new DecompressionStream('deflate-raw');
              const decompressedStreamRaw = streamRaw.pipeThrough(dsRaw);
              decompressed = await new Response(decompressedStreamRaw).text();
            }
          }
        }
      }
    } catch {}

    const textSource = decompressed || streamContent;
    const extracted = extractTextFromPdfStream(textSource);
    if (extracted && extracted.trim().length > 0) {
      textChunks.push(extracted.trim());
    }
  }

  // 2. Also search for any uncompressed text operations outside streams
  const directText = extractTextFromPdfStream(latin1Str);
  if (directText && directText.trim().length > 0) {
    textChunks.push(directText.trim());
  }

  const combined = textChunks.join('\n\n').trim();

  // If we couldn't extract enough text from custom binary streams, return whatever clean strings we found
  if (combined.length > 50) {
    return cleanExtractedText(combined);
  }

  // Fallback: extract ASCII string literals from PDF
  const literalMatches = latin1Str.match(/\(([^()]{3,})\)/g) || [];
  const cleanLiterals = literalMatches
    .map((s) => s.slice(1, -1))
    .filter((s) => !/[/\\%<>]/.test(s) && /[a-zA-Z]{2,}/.test(s))
    .join(' ');

  return cleanExtractedText(cleanLiterals.length > combined.length ? cleanLiterals : combined);
}

/**
 * Parses PDF text operations: (text) Tj, [(t) (e) (x) (t)] TJ, ' or "
 */
function extractTextFromPdfStream(content: string): string {
  const lines: string[] = [];

  // Match TJ arrays: [(Hello) 10 (World)] TJ
  const tjArrayRegex = /\[((?:(?:\(.*?\))|(?:\s*-?\d+(?:\.\d+)?\s*))+)\]\s*TJ/g;
  let tjMatch: RegExpExecArray | null;

  while ((tjMatch = tjArrayRegex.exec(content)) !== null) {
    const inner = tjMatch[1];
    const strRegex = /\((.*?)\)/g;
    let strMatch: RegExpExecArray | null;
    let word = '';
    while ((strMatch = strRegex.exec(inner)) !== null) {
      word += decodePdfString(strMatch[1]);
    }
    if (word.trim()) {
      lines.push(word.trim());
    }
  }

  // Match single string: (Hello World) Tj
  const tjSingleRegex = /\((.*?)\)\s*Tj/g;
  let singleMatch: RegExpExecArray | null;
  while ((singleMatch = tjSingleRegex.exec(content)) !== null) {
    const text = decodePdfString(singleMatch[1]);
    if (text.trim()) {
      lines.push(text.trim());
    }
  }

  return lines.join(' ');
}

function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}
