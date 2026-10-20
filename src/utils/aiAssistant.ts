import { ResumeData, TargetAnalysis } from '../types/resume';

const POWER_ACTION_VERBS = [
  'Spearheaded', 'Architected', 'Engineered', 'Accelerated', 'Optimized',
  'Orchestrated', 'Transformed', 'Pioneered', 'Delivered', 'Automated',
  'Streamlined', 'Expanded', 'Secured', 'Maximized', 'Implemented'
];

interface BulletImprovementSuggestion {
  original: string;
  improved: string;
  scoreDelta: number;
  reason: string;
}

export function improveBulletPoint(bullet: string, role?: string): BulletImprovementSuggestion {
  const clean = bullet.trim();
  const lower = clean.toLowerCase();

  // If bullet has weak phrase or lacks metrics, transform it
  if (lower.includes('responsible for') || lower.includes('duties included')) {
    const core = clean.replace(/^(responsible for|duties included)\s*/i, '');
    const verb = POWER_ACTION_VERBS[Math.floor(Math.random() * POWER_ACTION_VERBS.length)];
    const capitalized = core.charAt(0).toLowerCase() + core.slice(1);
    return {
      original: clean,
      improved: `${verb} ${capitalized}, boosting overall pipeline efficiency by 34% and cutting turnaround time.`,
      scoreDelta: 16,
      reason: 'Replaced passive "responsible for" with power verb and quantified impact (+34% efficiency).'
    };
  }

  if (lower.includes('assisted') || lower.includes('helped') || lower.includes('worked on')) {
    const core = clean.replace(/^(assisted with|helped with|helped|worked on)\s*/i, '');
    const capitalized = core.charAt(0).toLowerCase() + core.slice(1);
    return {
      original: clean,
      improved: `Partnered with cross-functional stakeholders to deliver ${capitalized}, achieving 99.8% on-time delivery across 12 milestone releases.`,
      scoreDelta: 14,
      reason: 'Elevated supportive language into collaborative ownership backed by reliable delivery metrics.'
    };
  }

  if (lower.includes('intranet') || lower.includes('redesign') || lower.includes('website')) {
    return {
      original: clean,
      improved: `Rebuilt system workflows and user interfaces, cutting document-retrieval time 30% for an organization of 200+ employees.`,
      scoreDelta: 18,
      reason: 'Added concrete time savings (-30%) and organizational scope (200+ employees).'
    };
  }

  if (lower.includes('seo') || lower.includes('traffic') || lower.includes('marketing')) {
    return {
      original: clean,
      improved: `Led SEO and audience acquisition strategy across $500K annual budget, growing organic traffic 42% and ranking 15 target keywords on Google page one.`,
      scoreDelta: 15,
      reason: 'Quantified budget scale ($500K), growth percentage (+42%), and specific ranking milestones.'
    };
  }

  if (lower.includes('bug') || lower.includes('test') || lower.includes('quality')) {
    return {
      original: clean,
      improved: `Instituted automated integration testing and CI/CD quality gates, reducing production regression rate by 65% across 4 core microservices.`,
      scoreDelta: 17,
      reason: 'Replaced general bug fixing with automated quality infrastructure and measured regression drop.'
    };
  }

  // General enhancement: inject active verb + quantifiable result
  const verb = POWER_ACTION_VERBS[Math.floor(Math.random() * POWER_ACTION_VERBS.length)];
  const words = clean.split(/\s+/);
  const firstWord = words[0];
  const rest = words.slice(1).join(' ');

  return {
    original: clean,
    improved: `${verb} ${rest.charAt(0).toLowerCase() + rest.slice(1)}, accelerating throughput by 28% and ensuring high-availability SLA.`,
    scoreDelta: 12,
    reason: `Upgraded initial verb "${firstWord}" into decisive leadership phrasing with measurable ROI.`
  };
}

export function generateBulletPointsForRole(role: string, company?: string, keywords: string[] = []): string[] {
  const r = role.toLowerCase();
  const kw = keywords.length > 0 ? keywords.slice(0, 3).join(', ') : '';

  if (r.includes('engineer') || r.includes('developer') || r.includes('architect')) {
    return [
      `Architected high-throughput microservices using ${kw || 'TypeScript and cloud runtimes'}, lowering p99 API latency by 45% under 10M+ daily requests.`,
      `Pioneered automated CI/CD deployment pipelines, cutting release cycle time from 2 weeks to under 4 hours with 99.98% uptime.`,
      `Engineered end-to-end telemetry and monitoring suites, resolving 95% of critical edge incidents prior to customer impact.`,
      `Mentored 6 junior and mid-level software engineers on modern software design patterns, system scalability, and test-driven development.`
    ];
  }

  if (r.includes('product') || r.includes('manager') || r.includes('owner')) {
    return [
      `Spearheaded product discovery and MVP execution for core SaaS platform, driving $1.8M in net new ARR within the first two quarters.`,
      `Conducted user research across 150+ enterprise customers to prioritize the product backlog, increasing 30-day user retention by 24%.`,
      `Collaborated closely with design and engineering leads to launch 4 major feature iterations on time and under allocated budget.`,
      `Established core product analytics dashboards using Mixpanel and SQL to track feature adoption and onboarding conversion.`
    ];
  }

  if (r.includes('marketing') || r.includes('growth') || r.includes('sales')) {
    return [
      `Orchestrated multichannel customer acquisition campaigns across paid search, paid social, and SEO, scaling inbound MQLs by 68%.`,
      `Decreased blended Customer Acquisition Cost (CAC) by 26% through iterative landing page A/B testing and lifecycle email automation.`,
      `Partnered with sales engineering to produce sales enablement assets, shortening average B2B enterprise deal cycles from 90 to 45 days.`,
      `Managed $600K annual performance marketing budget, consistently surpassing quarterly pipeline targets by an average of 118%.`
    ];
  }

  // Default professional bullet points
  return [
    `Spearheaded key operational initiatives that increased departmental efficiency by 32% within 6 months.`,
    `Collaborated with leadership and cross-functional teams to streamline workflows, reducing project delivery cycle times by 3 weeks.`,
    `Managed operational budget and vendor contracts, successfully negotiating a 15% cost reduction without compromising deliverable quality.`,
    `Implemented standardized performance metrics and automated reporting dashboards to support data-driven executive decisions.`
  ];
}

export function generateSummary(jobTitle: string, yearsExp: number = 5, topSkills: string[] = []): string {
  const skillsStr = topSkills.length > 0 ? topSkills.slice(0, 4).join(', ') : 'modern tech stacks and cross-functional leadership';
  return `Results-driven ${jobTitle || 'Professional'} with ${yearsExp}+ years of documented success in driving business and technical milestones. Proven expertise in ${skillsStr}. Adept at leading high-performing teams, optimizing complex workflows, and delivering high-impact solutions in fast-paced environments.`;
}

// Common tech, product, and business keyword dictionary for extraction
const COMMON_INDUSTRY_KEYWORDS = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python', 'Go', 'Rust',
  'Java', 'C++', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Microservices', 'CI/CD',
  'Agile', 'Scrum', 'Product Strategy', 'Roadmapping', 'User Research', 'A/B Testing',
  'Data Analytics', 'Tableau', 'Power BI', 'SEO', 'SEM', 'Performance Marketing',
  'Customer Acquisition', 'Retention', 'P&L Management', 'Cross-functional Leadership',
  'System Architecture', 'Scalability', 'SOC2', 'Security', 'Git', 'Automated Testing',
  'Design Systems', 'Figma', 'UI/UX Design', 'API Design', 'Machine Learning', 'AI'
];

export function analyzeJobDescription(jobTitle: string, jobDescription: string, resume: ResumeData): TargetAnalysis {
  const resumeText = [
    resume.contact.fullName,
    resume.contact.jobTitle,
    resume.summary,
    ...resume.experiences.flatMap(e => [e.company, e.role, ...e.bullets]),
    ...resume.educations.flatMap(ed => [ed.school, ed.degree, ed.fieldOfStudy]),
    ...resume.skillCategories.flatMap(sc => sc.skills),
    ...resume.projects.flatMap(p => [p.name, p.description, ...p.technologies, ...p.bullets])
  ].join(' ').toLowerCase();

  const jdLower = jobDescription.toLowerCase();

  // Extract keywords mentioned in JD
  const foundInJd = new Set<string>();

  COMMON_INDUSTRY_KEYWORDS.forEach(kw => {
    if (jdLower.includes(kw.toLowerCase())) {
      foundInJd.add(kw);
    }
  });

  // Also check for capitalized phrases or capitalized words in JD that look like requirements
  const customWords = jobDescription.match(/\b[A-Z][a-zA-Z0-9+#.-]{2,}\b/g) || [];
  customWords.forEach(w => {
    const wLower = w.toLowerCase();
    if (!['The', 'And', 'For', 'With', 'You', 'Our', 'Will', 'Are', 'This', 'Have', 'Must', 'From'].includes(w)) {
      if (w.length >= 3 && !foundInJd.has(w)) {
        foundInJd.add(w);
      }
    }
  });

  const jdKeywordsList = Array.from(foundInJd);
  if (jdKeywordsList.length === 0) {
    // Fallback if generic JD
    jdKeywordsList.push('Agile', 'Cross-functional Leadership', 'Communication', 'Problem Solving', 'Data Analysis');
  }

  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  jdKeywordsList.forEach(kw => {
    if (resumeText.includes(kw.toLowerCase())) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const total = jdKeywordsList.length;
  const matched = foundKeywords.length;
  const matchScore = total > 0 ? Math.round((matched / total) * 100) : 50;

  return {
    jobTitle: jobTitle || 'Target Role',
    targetCompany: 'Target Company',
    jobDescription,
    matchScore,
    foundKeywords,
    missingKeywords,
    recommendedKeywords: missingKeywords.slice(0, 6)
  };
}

export function generateCoverLetter(resume: ResumeData, jobTitle: string, companyName: string = 'Hiring Team'): string {
  const name = resume.contact.fullName || 'Candidate';
  const role = jobTitle || resume.contact.jobTitle || 'the open position';
  const skills = resume.skillCategories[0]?.skills.slice(0, 3).join(', ') || 'strategic problem-solving and cross-functional leadership';

  const recentExp = resume.experiences[0];
  const achievement = recentExp && recentExp.bullets[0] ? recentExp.bullets[0] : 'consistently delivered measurable impact across core business and engineering goals.';

  return `Dear ${companyName} Hiring Team,

I am writing to enthusiastically submit my application for the ${role} position. With a strong track record in ${skills}, I have spent my career designing and delivering scalable solutions that generate tangible value.

In my recent work at ${recentExp?.company || 'my previous company'}, I ${achievement.charAt(0).toLowerCase() + achievement.slice(1)} My approach centers on combining strategic rigor with collaborative execution, ensuring technical and organizational goals are exceeded.

I am particularly excited about the opportunity at ${companyName} because of your commitment to innovation and impact. I welcome the opportunity to discuss how my background in ${skills} will contribute to your team's ongoing success.

Thank you for your time and consideration.

Warm regards,

${name}
${resume.contact.email} | ${resume.contact.phone}
${resume.contact.linkedin ? resume.contact.linkedin : ''}`;
}
