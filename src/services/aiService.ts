import { improveBulletPoint as fallbackImproveBullet, generateBulletPointsForRole as fallbackGenerateBullets, generateSummary as fallbackGenerateSummary, generateCoverLetter as fallbackGenerateCoverLetter } from '../utils/aiAssistant';
import { ResumeData } from '../types/resume';

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function getAiConfig(): AiConfig {
  const runtimeEnv = (typeof window !== 'undefined' && (window as any).__ENV__) || {};
  return {
    baseUrl: (runtimeEnv.VITE_AI_BASE_URL || import.meta.env.VITE_AI_BASE_URL || 'https://api.9router.com/v1').trim(),
    apiKey: (runtimeEnv.VITE_AI_API_KEY || import.meta.env.VITE_AI_API_KEY || '').trim(),
    model: (runtimeEnv.VITE_AI_MODEL || import.meta.env.VITE_AI_MODEL || 'ag/gemini-3.8-flash').trim(),
  };
}

export function getRequestEndpoint(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const config = getAiConfig();

  // If baseUrl is a relative path (e.g. /api/9router)
  if (config.baseUrl.startsWith('/')) {
    return `${config.baseUrl.replace(/\/+$/, '')}${cleanPath}`;
  }

  if (import.meta.env.DEV) {
    return `/api/9router${cleanPath}`;
  }

  const cleanBase = (config.baseUrl || 'https://api.9router.com/v1').replace(/\/+$/, '');
  return `${cleanBase}${cleanPath}`;
}

export interface AiStatusResult {
  status: 'connected' | 'disconnected' | 'checking';
  latencyMs?: number;
  message: string;
  model: string;
  baseUrl: string;
}

export async function checkAiStatus(): Promise<AiStatusResult> {
  const config = getAiConfig();
  if (!config.apiKey || !config.apiKey.trim()) {
    return {
      status: 'disconnected',
      message: 'API Key belum diset di .env (VITE_AI_API_KEY)',
      model: config.model,
      baseUrl: config.baseUrl,
    };
  }

  const startTime = performance.now();
  const endpoint = getRequestEndpoint('/models');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey.trim()}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errText = await res.text();
      return {
        status: 'disconnected',
        latencyMs,
        message: `HTTP ${res.status}: ${errText.slice(0, 100)}`,
        model: config.model,
        baseUrl: config.baseUrl,
      };
    }

    const data = await res.json().catch(() => null);
    const availableModels: string[] = Array.isArray(data?.data) ? data.data.map((m: any) => m.id) : [];
    const modelFound = availableModels.includes(config.model);

    return {
      status: 'connected',
      latencyMs,
      message: modelFound
        ? `9router connected (Model "${config.model}" siap)`
        : `9router connected (${availableModels.length} model aktif)`,
      model: config.model,
      baseUrl: config.baseUrl,
    };
  } catch (err: any) {
    const isAbort = err.name === 'AbortError';
    return {
      status: 'disconnected',
      message: isAbort ? 'Connection timeout (8s)' : (err.message || 'Gagal tersambung ke endpoint 9router'),
      model: config.model,
      baseUrl: config.baseUrl,
    };
  }
}

async function callSingleChatRequest(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  timeoutMs: number
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`9router (${model}) response error:`, res.status);
      return null;
    }

    const text = await res.text();

    // 1. Try standard JSON response
    try {
      const data = JSON.parse(text);
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim().length > 0) {
        return content.trim();
      }
    } catch {
      // Response is not standard JSON (likely SSE stream)
    }

    // 2. Parse Server-Sent Events (SSE) chunks: "data: {...}"
    const lines = text.split('\n');
    let fullContent = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data:') && !trimmed.includes('[DONE]')) {
        const jsonStr = trimmed.replace(/^data:\s*/, '');
        try {
          const chunk = JSON.parse(jsonStr);
          const delta = chunk.choices?.[0]?.delta?.content || chunk.choices?.[0]?.text || '';
          fullContent += delta;
        } catch {
          // Ignore invalid JSON chunks
        }
      }
    }

    if (fullContent.trim().length > 0) {
      return fullContent.trim();
    }

    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`9router (${model}) request failed:`, err);
    return null;
  }
}

async function call9RouterChat(systemPrompt: string, userPrompt: string, maxTokens: number = 500): Promise<string | null> {
  const config = getAiConfig();
  if (!config.apiKey || !config.apiKey.trim()) {
    return null;
  }

  const endpoint = getRequestEndpoint('/chat/completions');
  const configuredModel = config.model || 'ag/gemini-3.8-flash-low';

  // Attempt configured model (10s timeout)
  let result = await callSingleChatRequest(
    endpoint,
    config.apiKey,
    configuredModel,
    systemPrompt,
    userPrompt,
    maxTokens,
    10000
  );

  // If the configured model timed out or failed and it wasn't the verified fast model, fallback to ag/gemini-3.8-flash-low
  if (!result && configuredModel !== 'ag/gemini-3.8-flash-low') {
    console.info(`Falling back to verified fast model (ag/gemini-3.8-flash-low)...`);
    result = await callSingleChatRequest(
      endpoint,
      config.apiKey,
      'ag/gemini-3.8-flash-low',
      systemPrompt,
      userPrompt,
      maxTokens,
      10000
    );
  }

  return result;
}

export async function aiImproveBullet(
  bullet: string,
  role?: string,
  company?: string
): Promise<{ original: string; improved: string; scoreDelta: number; reason: string }> {
  const systemPrompt = `You are ResumeCraft AI's elite ATS Resume Bullet Optimizer.
Convert weak, passive, or unquantified resume bullet points into high-impact, ATS-optimized achievement statements.
Rules:
1. Always start with an active, commanding power verb (e.g., Spearheaded, Architected, Engineered, Accelerated, Overhauled).
2. Quantify achievements with metrics (percentages, dollar amounts, time saved, team size).
3. Provide ONLY the improved bullet point statement without conversational filler.`;

  const userPrompt = `Role: ${role || 'Professional'} at ${company || 'Company'}
Original Bullet: "${bullet}"
Provide the improved ATS bullet point:`;

  const aiResult = await call9RouterChat(systemPrompt, userPrompt, 250);
  if (aiResult) {
    // 1. Try parsing JSON if model returned JSON
    try {
      const cleaned = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.improved) {
        return {
          original: bullet,
          improved: parsed.improved,
          scoreDelta: Number(parsed.scoreDelta) || 16,
          reason: parsed.reason || 'Upgraded with strong action verbs and quantified impact metrics.'
        };
      }
    } catch {
      // Not JSON
    }

    // 2. Extract best bullet line from plain text response
    const lines = aiResult
      .split('\n')
      .map(l => l.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(l => l.length > 25 && !l.toLowerCase().startsWith('here') && !l.toLowerCase().startsWith('sure'));

    const candidate = lines[0] || aiResult.trim();
    if (candidate && candidate.length > 15) {
      return {
        original: bullet,
        improved: candidate.replace(/^["']|["']$/g, ''),
        scoreDelta: 16,
        reason: 'Upgraded with strong action verbs and quantified impact metrics.'
      };
    }
  }

  // Graceful local algorithmic fallback
  return fallbackImproveBullet(bullet, role);
}

export async function aiGenerateRoleBullets(
  role: string,
  company?: string,
  keywords: string[] = []
): Promise<string[]> {
  const systemPrompt = `You are ResumeCraft AI. Generate 3 to 4 world-class ATS-optimized resume bullet points for the given job title and company.
Rules:
1. Every bullet must start with a power verb.
2. Every bullet must include measurable results (% increase, $ saved, latency drop, revenue generated).
3. Return each bullet point on its own line starting with a dash (- ).`;

  const userPrompt = `Job Title: ${role}
Company: ${company || 'Technology Company'}
Keywords to weave in: ${keywords.join(', ') || 'modern methodologies, scalability, leadership'}
Generate the bullets:`;

  const aiResult = await call9RouterChat(systemPrompt, userPrompt, 400);
  if (aiResult) {
    // 1. Try JSON array
    try {
      const cleaned = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(b => String(b).replace(/^[-*•\d.]+\s*/, '').trim());
      }
    } catch {
      // Not JSON array
    }

    // 2. Extract bullet lines
    const lines = aiResult
      .split('\n')
      .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(line => line.length > 20 && !line.toLowerCase().startsWith('here') && !line.toLowerCase().startsWith('sure'));

    if (lines.length >= 2) {
      return lines.slice(0, 4);
    }
  }

  return fallbackGenerateBullets(role, company, keywords);
}

export async function aiGenerateSummary(
  jobTitle: string,
  yearsExp: number = 6,
  topSkills: string[] = []
): Promise<string> {
  const systemPrompt = `You are ResumeCraft AI. Write a concise, powerful 3-4 sentence professional executive resume summary (around 50-80 words).
Avoid first-person pronouns ("I", "my", "we"). Focus on domain mastery, leadership, and measurable business impact.`;

  const userPrompt = `Job Title: ${jobTitle}
Years of Experience: ${yearsExp}
Top Skills: ${topSkills.join(', ')}`;

  const aiResult = await call9RouterChat(systemPrompt, userPrompt, 200);
  if (aiResult) {
    return aiResult.replace(/^"|"$/g, '').trim();
  }

  return fallbackGenerateSummary(jobTitle, yearsExp, topSkills);
}

export async function aiGenerateCoverLetter(
  resume: ResumeData,
  targetRole: string,
  targetCompany: string
): Promise<string> {
  const systemPrompt = `You are ResumeCraft AI's Cover Letter Generator.
Write a personalized, highly persuasive 3-paragraph ATS cover letter for the candidate applying to the target company and role.
Incorporate key accomplishments and skills from the candidate's resume naturally.`;

  const userPrompt = `Candidate Name: ${resume.contact.fullName}
Target Role: ${targetRole}
Target Company: ${targetCompany}
Candidate Background:
Summary: ${resume.summary}
Top Experience: ${resume.experiences[0]?.role} at ${resume.experiences[0]?.company}
Top Achievement: ${resume.experiences[0]?.bullets[0] || 'Led key operational delivery'}
Key Skills: ${resume.skillCategories[0]?.skills.join(', ')}`;

  const aiResult = await call9RouterChat(systemPrompt, userPrompt, 600);
  if (aiResult) {
    return aiResult;
  }

  return fallbackGenerateCoverLetter(resume, targetRole, targetCompany);
}
