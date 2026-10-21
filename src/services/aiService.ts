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
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (config.apiKey && config.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }

  let lastErrorMessage = 'Gagal tersambung ke endpoint AI';

  // 1. Primary Health Check: Test GET /models (standard OpenAI endpoint, fast, 0 token usage, validates key & gateway)
  const modelCandidates = getEndpointCandidates('/models');
  for (const mEndpoint of modelCandidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(mEndpoint, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      // If SPA HTML fallback, skip to next candidate
      if (contentType.includes('text/html')) {
        continue;
      }

      if (res.ok) {
        if (mEndpoint.startsWith('/api/ai')) {
          verifiedPrefix = '/api/ai';
        } else {
          verifiedPrefix = (config.baseUrl || '').replace(/\/+$/, '');
        }

        const latencyMs = Math.round(performance.now() - startTime);
        return {
          status: 'connected',
          latencyMs,
          message: `AI Gateway tersambung (${latencyMs}ms)`,
          model: config.model,
          baseUrl: config.baseUrl,
        };
      }

      if (res.status === 401) {
        return {
          status: 'disconnected',
          message: 'HTTP 401: API Key tidak valid / Unauthorized',
          model: config.model,
          baseUrl: config.baseUrl,
        };
      } else if (res.status === 403) {
        return {
          status: 'disconnected',
          message: 'HTTP 403: Akses ditolak',
          model: config.model,
          baseUrl: config.baseUrl,
        };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        lastErrorMessage = 'Connection timeout (15s)';
      } else {
        lastErrorMessage = err.message || 'Gagal tersambung (Network Error)';
      }
    }
  }

  // 2. Secondary Health Check: Test /chat/completions (for proxies without /models endpoint)
  const chatCandidates = getEndpointCandidates('/chat/completions');
  const modelsToTest = [
    config.model,
    ...(config.model !== 'ag/gemini-3.8-flash' ? ['ag/gemini-3.8-flash'] : []),
    ...(config.model !== 'gemini/gemini-3.8-flash' ? ['gemini/gemini-3.8-flash'] : []),
    ...(config.model !== 'gemini-2.0-flash' ? ['gemini-2.0-flash'] : []),
    ...(config.model !== 'gpt-4o-mini' ? ['gpt-4o-mini'] : []),
  ];

  for (const endpoint of chatCandidates) {
    for (let i = 0; i < modelsToTest.length; i++) {
      const testModel = modelsToTest[i];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const chatHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (config.apiKey && config.apiKey.trim()) {
          chatHeaders['Authorization'] = `Bearer ${config.apiKey.trim()}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: chatHeaders,
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          break;
        }

        const latencyMs = Math.round(performance.now() - startTime);

        if (res.ok) {
          if (endpoint.startsWith('/api/ai')) {
            verifiedPrefix = '/api/ai';
          } else {
            verifiedPrefix = (config.baseUrl || '').replace(/\/+$/, '');
          }

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

        // Non-200 response
        const errText = await res.text();
        let parsedMsg = errText.slice(0, 120);
        try {
          const json = JSON.parse(errText);
          if (json.error?.message) {
            parsedMsg = json.error.message;
          }
        } catch {}

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
    ...(model !== 'gemini/gemini-3.8-flash' ? ['gemini/gemini-3.8-flash'] : []),
    ...(model !== 'gemini/gemini-3.5-flash-lite' ? ['gemini/gemini-3.5-flash-lite'] : []),
    ...(model !== 'gemini-2.0-flash' ? ['gemini-2.0-flash'] : []),
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

/**
 * AI LinkedIn Profile Parser
 * Converts raw LinkedIn text or PDF export text into a structured ResumeData object.
 */
export async function aiParseLinkedInProfile(
  rawProfileText: string,
  optimizeAts: boolean = true,
  fallbackDesign?: ResumeData['design']
): Promise<ResumeData> {
  const systemPrompt = `You are ResumeCraft AI, an elite ATS Resume Architect and Career Consultant.
Your task is to parse raw text extracted from a LinkedIn profile or LinkedIn "Save to PDF" export and convert it into a complete, clean, JSON object that strictly adheres to the ResumeData structure.

Rules:
1. Contact: extract fullName, jobTitle (from headline/current role), email, phone, location, linkedin URL, github (if mentioned), website.
2. Summary: write a strong, concise 2-4 sentence professional summary under "summary" based on the "About" section or background.
3. Experiences: extract all jobs with company, role, location, startDate, endDate, current (boolean), and bullets (array of strings).
   ${
     optimizeAts
       ? 'CRITICAL ATS OPTIMIZATION: Convert descriptions into impactful bullet points starting with strong Action Verbs (e.g. Spearheaded, Engineered, Orchestrated, Optimized, Accelerated, Delivered) and include quantifiable metrics, business impact, or scale.'
       : 'PRESERVE ORIGINAL: Keep descriptions as close to the candidate\'s original wording as possible without altering the voice.'
   }
4. Education: extract school, degree, fieldOfStudy, location, startDate, endDate, gpa (if mentioned).
5. Skills: extract skills and group them into logical categories (e.g., "Core Expertise", "Technologies & Tools", "Leadership & Soft Skills") under "skillCategories", each having "categoryName" and "skills" (array of strings).
6. Certifications: extract name, issuer, date if available.
7. Projects: extract project name, description, technologies, bullets if available.
8. Output Format: Respond ONLY with a valid JSON object matching the schema below. No markdown explanations outside the JSON block.

JSON Schema:
{
  "contact": {
    "fullName": "string",
    "jobTitle": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string",
    "showPhoto": false
  },
  "summary": "string",
  "experiences": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "skillCategories": [
    {
      "categoryName": "string",
      "skills": ["string"]
    }
  ],
  "projects": [],
  "certifications": []
}`;

  const userPrompt = `Here is the raw LinkedIn profile text to parse:
"""
${rawProfileText.slice(0, 15000)}
"""

Extract and output the JSON object:`;

  const aiResult = await call9RouterChat(systemPrompt, userPrompt, 3000);
  if (aiResult) {
    try {
      const cleaned = aiResult.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
        return normalizeParsedLinkedInData(parsed, fallbackDesign);
      }
    } catch (e) {
      console.warn('Failed to parse AI JSON for LinkedIn profile:', e);
    }
  }

  // Fallback to local heuristic extraction
  return fallbackParseLinkedIn(rawProfileText, fallbackDesign);
}

function normalizeParsedLinkedInData(
  parsed: any,
  fallbackDesign?: ResumeData['design']
): ResumeData {
  const defaultDesign: ResumeData['design'] = fallbackDesign || {
    template: 'modern',
    fontFamily: 'Inter',
    fontSize: 'base',
    lineSpacing: 'normal',
    pageMargin: 'normal',
    sectionSpacing: 'normal',
    accentColor: '#059669',
    showDividers: true,
    dividerStyle: 'solid',
    uppercaseHeaders: true,
  };

  const contact = parsed.contact || {};

  return {
    id: `resume-linkedin-${Date.now()}`,
    title: `${contact.fullName || 'LinkedIn Profile'} Resume`,
    updatedAt: new Date().toISOString(),
    contact: {
      fullName: String(contact.fullName || 'Professional').trim(),
      jobTitle: String(contact.jobTitle || 'Specialist').trim(),
      email: String(contact.email || '').trim(),
      phone: String(contact.phone || '').trim(),
      location: String(contact.location || '').trim(),
      linkedin: String(contact.linkedin || '').trim(),
      github: String(contact.github || '').trim(),
      website: String(contact.website || '').trim(),
      showPhoto: Boolean(contact.showPhoto),
    },
    summary: String(parsed.summary || '').trim(),
    experiences: Array.isArray(parsed.experiences)
      ? parsed.experiences.map((exp: any, idx: number) => ({
          id: `exp-${Date.now()}-${idx}`,
          company: String(exp.company || 'Company').trim(),
          role: String(exp.role || 'Role').trim(),
          location: String(exp.location || '').trim(),
          startDate: String(exp.startDate || '').trim(),
          endDate: String(exp.endDate || (exp.current ? 'Present' : '')).trim(),
          current: Boolean(exp.current),
          bullets: Array.isArray(exp.bullets) && exp.bullets.length > 0
            ? exp.bullets.map((b: any) => String(b).replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean)
            : ['Led cross-functional operations and delivered key organizational milestones.'],
        }))
      : [],
    educations: Array.isArray(parsed.educations || parsed.education)
      ? (parsed.educations || parsed.education).map((edu: any, idx: number) => ({
          id: `edu-${Date.now()}-${idx}`,
          school: String(edu.school || 'University').trim(),
          degree: String(edu.degree || 'Bachelor Degree').trim(),
          fieldOfStudy: String(edu.fieldOfStudy || '').trim(),
          location: String(edu.location || '').trim(),
          startDate: String(edu.startDate || '').trim(),
          endDate: String(edu.endDate || '').trim(),
          gpa: edu.gpa ? String(edu.gpa) : undefined,
        }))
      : [],
    skillCategories: Array.isArray(parsed.skillCategories) && parsed.skillCategories.length > 0
      ? parsed.skillCategories.map((cat: any, idx: number) => ({
          id: `skill-${Date.now()}-${idx}`,
          categoryName: String(cat.categoryName || 'Skills').trim(),
          skills: Array.isArray(cat.skills)
            ? cat.skills.map((s: any) => String(s).trim()).filter(Boolean)
            : [],
        }))
      : [
          {
            id: `skill-${Date.now()}-0`,
            categoryName: 'Core Competencies',
            skills: ['Leadership', 'Problem Solving', 'Strategic Planning', 'Communication'],
          },
        ],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((proj: any, idx: number) => ({
          id: `proj-${Date.now()}-${idx}`,
          name: String(proj.name || 'Project').trim(),
          description: String(proj.description || '').trim(),
          link: proj.link ? String(proj.link).trim() : undefined,
          technologies: Array.isArray(proj.technologies)
            ? proj.technologies.map((t: any) => String(t).trim()).filter(Boolean)
            : [],
          bullets: Array.isArray(proj.bullets)
            ? proj.bullets.map((b: any) => String(b).trim()).filter(Boolean)
            : [],
        }))
      : [],
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications.map((cert: any, idx: number) => ({
          id: `cert-${Date.now()}-${idx}`,
          name: String(cert.name || 'Certification').trim(),
          issuer: String(cert.issuer || '').trim(),
          date: String(cert.date || '').trim(),
          url: cert.url ? String(cert.url).trim() : undefined,
        }))
      : [],
    design: defaultDesign,
  };
}

/**
 * Heuristic client-side fallback in case AI gateway is unreachable
 */
function fallbackParseLinkedIn(
  rawText: string,
  fallbackDesign?: ResumeData['design']
): ResumeData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneMatch = rawText.match(/(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract linkedin link
  const linkedinMatch = rawText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  // First line often candidate name
  const fullName = lines[0] && lines[0].length < 40 ? lines[0] : 'Professional Candidate';
  const jobTitle = lines[1] && lines[1].length < 60 ? lines[1] : 'Specialist';

  return normalizeParsedLinkedInData(
    {
      contact: {
        fullName,
        jobTitle,
        email,
        phone,
        location: '',
        linkedin,
      },
      summary: lines.slice(2, 6).join(' ').slice(0, 300) || 'Experienced professional with demonstrated expertise in delivering high-impact business outcomes.',
      experiences: [
        {
          company: 'Current Organization',
          role: jobTitle,
          location: '',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          bullets: [
            'Spearheaded key business and technological initiatives delivering measurable organizational impact.',
            'Collaborated across cross-functional departments to optimize operational workflows.'
          ]
        }
      ],
      educations: [
        {
          school: 'University',
          degree: 'Bachelor Degree',
          fieldOfStudy: '',
          location: '',
          startDate: '',
          endDate: ''
        }
      ],
      skillCategories: [
        {
          categoryName: 'Professional Skills',
          skills: ['Strategic Planning', 'Operations', 'Collaboration', 'Problem Solving']
        }
      ],
      projects: [],
      certifications: []
    },
    fallbackDesign
  );
}
