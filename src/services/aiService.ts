import {
  improveBulletPoint as fallbackImproveBullet,
  generateBulletPointsForRole as fallbackGenerateBullets,
  generateSummary as fallbackGenerateSummary,
  generateCoverLetter as fallbackGenerateCoverLetter
} from '../utils/aiAssistant';
import { ResumeData } from '../types/resume';

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  isServerAuth?: boolean;
}

export function getAiConfig(): AiConfig {
  let localConfig: Partial<AiConfig> = {};
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('resumecraft_ai_config');
      if (saved) localConfig = JSON.parse(saved);
    } catch {}
  }

  const runtimeEnv = (typeof window !== 'undefined' && (window as any).__ENV__) || {};
  const isServerAuth = Boolean(runtimeEnv.VITE_AI_SERVER_AUTH);

  return {
    baseUrl: (localConfig.baseUrl || runtimeEnv.VITE_AI_BASE_URL || '').trim(),
    apiKey: (localConfig.apiKey || runtimeEnv.VITE_AI_API_KEY || '').trim(),
    model: (localConfig.model || runtimeEnv.VITE_AI_MODEL || import.meta.env.VITE_AI_MODEL || 'ag/gemini-3.8-flash').trim(),
    isServerAuth,
  };
}

export function saveAiConfig(config: Partial<AiConfig>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getAiConfig();
    const updated = {
      ...current,
      ...config,
    };
    localStorage.setItem('resumecraft_ai_config', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save AI config to localStorage:', err);
  }
}

export function resetAiConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('resumecraft_ai_config');
  } catch {}
}

let verifiedPrefix: string | null = null;

export function getEndpointCandidates(path: string): string[] {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const config = getAiConfig();
  const candidates: string[] = [];

  // Prioritize previously verified prefix
  if (verifiedPrefix) {
    const verifiedUrl = `${verifiedPrefix.replace(/\/+$/, '')}${cleanPath}`;
    candidates.push(verifiedUrl);
  }

  // 1. Explicit custom path configured by user (e.g. /api/ai, https://api.openai.com/v1, or custom 9router)
  if (config.baseUrl) {
    if (config.baseUrl.startsWith('/')) {
      const relBase = config.baseUrl.replace(/\/+$/, '');
      const relUrl = `${relBase}${cleanPath}`;
      if (!candidates.includes(relUrl)) candidates.push(relUrl);
    } else {
      const cleanBase = config.baseUrl.replace(/\/+$/, '');
      const directUrl = `${cleanBase}${cleanPath}`;
      if (!candidates.includes(directUrl)) {
        candidates.push(directUrl);
      }
    }
  }

  // 2. Default local reverse proxy (/api/ai)
  // Available in Vite dev (vite.config.ts) and Docker Nginx (nginx.conf)
  // Guarantees NO CORS preflight errors and masks the remote AI URL
  const proxyUrl = `/api/ai${cleanPath}`;
  if (!candidates.includes(proxyUrl)) {
    candidates.push(proxyUrl);
  }

  return candidates;
}

export function getRequestEndpoint(path: string): string {
  const candidates = getEndpointCandidates(path);
  return candidates[0] || path;
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
  if (!config.apiKey && !config.isServerAuth) {
    return {
      status: 'disconnected',
      message: 'API Key belum diset di konfigurasi (VITE_AI_API_KEY)',
      model: config.model,
      baseUrl: config.baseUrl,
    };
  }

  const startTime = performance.now();
  const candidates = getEndpointCandidates('/chat/completions');
  let lastErrorMessage = 'Gagal tersambung ke endpoint AI';
  let lastStatus = 0;

  // Potential models to try if the current model gives 404 (model_not_found)
  const modelsToTest = [
    config.model,
    ...(config.model !== 'ag/gemini-3.8-flash' ? ['ag/gemini-3.8-flash'] : []),
    ...(config.model !== 'gemini-2.0-flash' ? ['gemini-2.0-flash'] : []),
    ...(config.model !== 'gpt-4o-mini' ? ['gpt-4o-mini'] : []),
  ];

  for (const endpoint of candidates) {
    for (let i = 0; i < modelsToTest.length; i++) {
      const testModel = modelsToTest[i];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (config.apiKey && config.apiKey.trim()) {
          headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type') || '';

        // If response is HTML (e.g. SPA fallback on static host without Nginx proxy), try next endpoint
        if (contentType.includes('text/html')) {
          break;
        }

        const latencyMs = Math.round(performance.now() - startTime);

        if (res.ok) {
          // Success! Set verified prefix
          if (endpoint.startsWith('/api/ai')) {
            verifiedPrefix = '/api/ai';
          } else {
            verifiedPrefix = (config.baseUrl || '').replace(/\/+$/, '');
          }

          // If fallback model succeeded instead of initial model, save it so future calls use it
          if (testModel !== config.model) {
            saveAiConfig({ model: testModel });
          }

          return {
            status: 'connected',
            latencyMs,
            message: testModel !== config.model
              ? `AI Gateway connected (Beralih ke model aktif "${testModel}")`
              : `AI Gateway connected (Model "${testModel}" siap)`,
            model: testModel,
            baseUrl: config.baseUrl,
          };
        }

        // Non-200 response from AI Gateway
        lastStatus = res.status;
        const errText = await res.text();
        let parsedMsg = errText.slice(0, 120);
        try {
          const json = JSON.parse(errText);
          if (json.error?.message) {
            parsedMsg = json.error.message;
          }
        } catch {}

        // If 404 (model_not_found), try next model candidate
        if (res.status === 404 || parsedMsg.toLowerCase().includes('model_not_found') || parsedMsg.toLowerCase().includes('credentials')) {
          lastErrorMessage = `Model "${testModel}" tidak aktif di gateway ini (${parsedMsg})`;
          continue;
        }

        if (res.status === 502 || res.status === 504) {
          lastErrorMessage = `HTTP ${res.status}: Bad Gateway (Upstream AI gateway tidak dapat dihubungi dari container)`;
          break;
        }

        if (res.status === 401) {
          lastErrorMessage = 'HTTP 401: API Key tidak valid / Unauthorized';
          break;
        } else if (res.status === 403) {
          lastErrorMessage = `HTTP 403: Akses ditolak (${parsedMsg})`;
          break;
        } else if (res.status === 429) {
          lastErrorMessage = 'HTTP 429: Kuota habis / Rate Limit tercapai';
          break;
        } else {
          lastErrorMessage = `HTTP ${res.status}: ${parsedMsg}`;
          break;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          lastErrorMessage = 'Connection timeout (20s)';
        } else {
          lastErrorMessage = err.message || 'Gagal tersambung (Network / CORS Error)';
        }
        break;
      }
    }
  }

  // Secondary Check: If /chat/completions failed, check /models as fallback
  if (lastStatus === 404 || lastStatus === 0) {
    const modelCandidates = getEndpointCandidates('/models');
    for (const mEndpoint of modelCandidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(mEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.apiKey.trim()}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html') || res.status === 404) continue;

        if (res.ok) {
          const latencyMs = Math.round(performance.now() - startTime);
          return {
            status: 'connected',
            latencyMs,
            message: `AI Gateway connected (Model "${config.model}")`,
            model: config.model,
            baseUrl: config.baseUrl,
          };
        }
      } catch {}
    }
  }

  return {
    status: 'disconnected',
    message: lastErrorMessage,
    model: config.model,
    baseUrl: config.baseUrl,
  };
}

async function callSingleChatRequest(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  timeoutMs: number
): Promise<string | null> {
  const candidates = getEndpointCandidates('/chat/completions');
  const modelsToTry = [
    model,
    ...(model !== 'ag/gemini-3.8-flash' ? ['ag/gemini-3.8-flash'] : []),
    ...(model !== 'gpt-4o-mini' ? ['gpt-4o-mini'] : []),
  ];

  for (const endpoint of candidates) {
    for (const targetModel of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (apiKey && apiKey.trim()) {
          headers['Authorization'] = `Bearer ${apiKey.trim()}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
          }),
        });
        clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          break; // Try next endpoint
        }

        if (!res.ok) {
          if (res.status === 404) {
            continue; // Try next model candidate
          }
          console.warn(`AI Gateway (${targetModel}) response error on ${endpoint}:`, res.status);
          continue;
        }

        // Mark verified prefix and model
        if (endpoint.startsWith('/api/ai')) {
          verifiedPrefix = '/api/ai';
        }
        if (targetModel !== model) {
          saveAiConfig({ model: targetModel });
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
        console.warn(`AI Gateway request to ${endpoint} failed:`, err);
        break; // Network failed on this endpoint, try next endpoint candidate
      }
    }
  }

  return null;
}

async function call9RouterChat(systemPrompt: string, userPrompt: string, maxTokens: number = 500): Promise<string | null> {
  const config = getAiConfig();
  if (!config.apiKey && !config.isServerAuth) {
    return null;
  }

  const configuredModel = config.model || 'ag/gemini-3.8-flash';

  // Attempt configured model (35s timeout)
  const result = await callSingleChatRequest(
    config.apiKey,
    configuredModel,
    systemPrompt,
    userPrompt,
    maxTokens,
    35000
  );

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
