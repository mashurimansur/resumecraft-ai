import { ResumeData, AtsScoreResult, ScoreIssue } from '../types/resume';

const STRONG_ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advised', 'allocated', 'analyzed',
  'architected', 'assembled', 'audited', 'authored', 'automated', 'boosted',
  'budgeted', 'built', 'calculated', 'centralized', 'championed', 'coached',
  'collaborated', 'conceived', 'conducted', 'configured', 'consolidated',
  'constructed', 'contracted', 'converted', 'coordinated', 'created', 'customized',
  'decreased', 'delivered', 'deployed', 'designed', 'developed', 'devised',
  'directed', 'dispatched', 'diversified', 'documented', 'doubled', 'drafted',
  'drove', 'eliminated', 'enabled', 'enforced', 'engineered', 'enhanced',
  'established', 'evaluated', 'examined', 'executed', 'expanded', 'expedited',
  'facilitated', 'forecasted', 'formulated', 'founded', 'generated', 'governed',
  'guided', 'halved', 'hired', 'identified', 'implemented', 'improved',
  'incorporated', 'increased', 'initiated', 'inspected', 'instituted',
  'instructed', 'integrated', 'invented', 'launched', 'lead', 'led',
  'leveraged', 'managed', 'maximized', 'mentored', 'migrated', 'minimized',
  'mobilized', 'moderated', 'modernized', 'monitored', 'motivated', 'negotiated',
  'optimized', 'orchestrated', 'organized', 'originated', 'outperformed',
  'overhauled', 'oversaw', 'partnered', 'performed', 'pioneered', 'planned',
  'prepared', 'presented', 'prioritized', 'produced', 'promoted', 'published',
  'raised', 'realigned', 'rebuilt', 'recruited', 'redesigned', 'reduced',
  'refactored', 'refined', 'reformed', 'remodeled', 'reorganized', 'replaced',
  'restructured', 'revamped', 'scaled', 'scheduled', 'secured', 'simplified',
  'slashed', 'solicited', 'solved', 'spearheaded', 'standardized', 'steered',
  'streamlined', 'strengthened', 'supervised', 'surpassed', 'synthesized',
  'targeted', 'trained', 'transformed', 'transitioned', 'tripled', 'unified',
  'upgraded', 'validated', 'verified'
]);

const WEAK_WORDS = [
  'responsible for',
  'duties included',
  'assisted with',
  'helped with',
  'worked on',
  'participated in',
  'tasked with',
  'handled',
  'tried to',
  'contributed to'
];

const BUZZWORDS = [
  'go-getter',
  'team player',
  'hard worker',
  'detail-oriented',
  'think outside the box',
  'synergy',
  'ninja',
  'rockstar',
  'guru',
  'work ethic',
  'results-oriented',
  'self-motivated'
];

const FIRST_PERSON_PRONOUNS = [
  '\\bi\\b',
  '\\bme\\b',
  '\\bmy\\b',
  '\\bmyself\\b',
  '\\bwe\\b',
  '\\bus\\b',
  '\\bour\\b',
  '\\bourselves\\b'
];

export function calculateAtsScore(resume: ResumeData): AtsScoreResult {
  const issues: ScoreIssue[] = [];

  let contentScore = 0; // Max 40
  let formattingScore = 0; // Max 30
  let completenessScore = 0; // Max 30

  let totalWords = 0;
  let actionVerbsFound = 0;
  let metricsFound = 0;
  let totalBullets = 0;
  let totalBulletWords = 0;
  let weakWordsFound = 0;

  // 1. CONTACT INFO CHECKS (Completeness)
  if (resume.contact.fullName.trim().length > 2) {
    completenessScore += 5;
  } else {
    issues.push({
      id: 'crit-name',
      category: 'completeness',
      severity: 'error',
      title: 'Missing Full Name',
      description: 'Your full name is required for applicant identification in ATS systems.',
      section: 'Contact Info',
      scoreDelta: 5,
      fixAction: 'Enter your full legal or professional name.'
    });
  }

  if (resume.contact.jobTitle.trim().length > 2) {
    completenessScore += 4;
  } else {
    issues.push({
      id: 'crit-title',
      category: 'completeness',
      severity: 'warning',
      title: 'Target Job Title Missing',
      description: 'Stating a clear target job title helps ATS algorithms classify your profile correctly.',
      section: 'Contact Info',
      scoreDelta: 4,
      fixAction: 'Add a professional job title matching your target role.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(resume.contact.email.trim())) {
    completenessScore += 4;
  } else {
    issues.push({
      id: 'crit-email',
      category: 'completeness',
      severity: 'error',
      title: 'Valid Email Address Required',
      description: 'ATS parsers look for standard email format to route candidate notifications.',
      section: 'Contact Info',
      scoreDelta: 4,
      fixAction: 'Add a valid professional email address.'
    });
  }

  if (resume.contact.phone.trim().length >= 7) {
    completenessScore += 3;
  } else {
    issues.push({
      id: 'crit-phone',
      category: 'completeness',
      severity: 'warning',
      title: 'Phone Number Missing',
      description: 'Recruiters and automated scheduling tools need a reachable phone number.',
      section: 'Contact Info',
      scoreDelta: 3,
      fixAction: 'Add your direct contact phone number.'
    });
  }

  if (resume.contact.location.trim().length > 2) {
    completenessScore += 3;
  } else {
    issues.push({
      id: 'crit-location',
      category: 'completeness',
      severity: 'warning',
      title: 'Location Missing',
      description: 'Location (City, State/Country) helps ATS filter for geographic and remote preferences.',
      section: 'Contact Info',
      scoreDelta: 3,
      fixAction: 'Add your city and country or state.'
    });
  }

  if (resume.contact.linkedin.trim().length > 3 || resume.contact.github.trim().length > 3) {
    completenessScore += 3;
  } else {
    issues.push({
      id: 'crit-social',
      category: 'completeness',
      severity: 'tip',
      title: 'Add LinkedIn or Portfolio Profile',
      description: 'Profiles with professional links receive 71% higher recruiter outreach rates.',
      section: 'Contact Info',
      scoreDelta: 3,
      fixAction: 'Add your LinkedIn or GitHub profile URL.'
    });
  }

  // 2. SUMMARY EVALUATION (Content & Completeness)
  const summaryWords = resume.summary.trim() ? resume.summary.trim().split(/\s+/).length : 0;
  totalWords += summaryWords;

  if (summaryWords >= 30 && summaryWords <= 130) {
    contentScore += 8;
  } else if (summaryWords > 0) {
    contentScore += 4;
    issues.push({
      id: 'crit-summary-len',
      category: 'content',
      severity: 'warning',
      title: summaryWords < 30 ? 'Professional Summary Too Brief' : 'Professional Summary Too Long',
      description: `Current length is ${summaryWords} words. Ideal ATS summary length is between 35 and 100 words.`,
      section: 'Summary',
      scoreDelta: 4,
      fixAction: 'Use the AI Summary Writer to generate a concise 3-4 sentence pitch.'
    });
  } else {
    issues.push({
      id: 'crit-summary-missing',
      category: 'completeness',
      severity: 'warning',
      title: 'Add a Professional Summary',
      description: 'An executive summary sets your positioning and injects high-density keywords immediately.',
      section: 'Summary',
      scoreDelta: 8,
      fixAction: 'Click "AI Generate Summary" to draft an impactful introduction.'
    });
  }

  // Check first person pronouns in summary
  const summaryHasFirstPerson = FIRST_PERSON_PRONOUNS.some(p => new RegExp(p, 'i').test(resume.summary));
  if (summaryHasFirstPerson) {
    contentScore = Math.max(0, contentScore - 3);
    issues.push({
      id: 'crit-summary-pronouns',
      category: 'content',
      severity: 'warning',
      title: 'First-Person Pronouns in Summary',
      description: 'ATS best practices recommend third-person implied style (avoid "I", "my", "we").',
      section: 'Summary',
      scoreDelta: 3,
      fixAction: 'Remove words like "I", "my", "we" and start sentences with skills or descriptors.'
    });
  }

  // 3. WORK EXPERIENCE & BULLET POINTS EVALUATION (Content & ATS)
  if (resume.experiences.length > 0) {
    completenessScore += 4;
    if (resume.experiences.length >= 2) completenessScore += 2;
  } else {
    issues.push({
      id: 'crit-exp-missing',
      category: 'completeness',
      severity: 'error',
      title: 'Work Experience Section Empty',
      description: 'Work history is the #1 evaluated section by applicant tracking systems.',
      section: 'Experience',
      scoreDelta: 6,
      fixAction: 'Add at least one relevant work or project experience.'
    });
  }

  let bulletsStartingWithActionVerb = 0;
  let bulletsWithMetrics = 0;
  let weakBulletsCount = 0;

  resume.experiences.forEach((exp, expIdx) => {
    if (exp.bullets.length === 0) {
      issues.push({
        id: `crit-exp-${expIdx}-empty`,
        category: 'content',
        severity: 'warning',
        title: `No Bullet Points for ${exp.company || 'Role'}`,
        description: 'Every work experience entry should feature 2 to 5 achievement-focused bullet points.',
        section: 'Experience',
        scoreDelta: 3,
        fixAction: 'Add descriptive accomplishment bullet points.'
      });
      return;
    }

    exp.bullets.forEach((bullet) => {
      const bTrimmed = bullet.trim();
      if (!bTrimmed) return;

      totalBullets++;
      const words = bTrimmed.split(/\s+/);
      totalBulletWords += words.length;
      totalWords += words.length;

      // First word action verb check
      const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, '');
      if (STRONG_ACTION_VERBS.has(firstWord)) {
        bulletsStartingWithActionVerb++;
        actionVerbsFound++;
      }

      // Metric / number check
      // Looks for numbers, percentages, dollar signs, metric multipliers ($500K, 30%, 4.5M, etc.)
      const hasMetric = /([$%€£]\s*\d+|\d+\s*[%]|(\d+(\.\d+)?\s*(k|m|b|x)\b)|\b\d{1,3}(,\d{3})+\b|\b\d+\s*(users|clients|leads|hours|days|team members|engineers|projects)\b)/i.test(bTrimmed);
      if (hasMetric) {
        bulletsWithMetrics++;
        metricsFound++;
      }

      // Check weak words
      const lower = bTrimmed.toLowerCase();
      for (const weak of WEAK_WORDS) {
        if (lower.includes(weak)) {
          weakWordsFound++;
          weakBulletsCount++;
          break;
        }
      }

      // Check buzzwords
      for (const buzz of BUZZWORDS) {
        if (lower.includes(buzz)) {
          issues.push({
            id: `crit-buzz-${Math.random()}`,
            category: 'content',
            severity: 'tip',
            title: `Avoid Cliché Phrase: "${buzz}"`,
            description: 'Replace generic buzzwords with concrete examples of what you accomplished.',
            section: 'Experience',
            scoreDelta: 1,
            fixAction: `Remove "${buzz}" and describe a measurable outcome instead.`
          });
          break;
        }
      }
    });
  });

  // Calculate bullet action verb ratio
  if (totalBullets > 0) {
    const actionVerbRatio = bulletsStartingWithActionVerb / totalBullets;
    if (actionVerbRatio >= 0.7) {
      contentScore += 12;
    } else if (actionVerbRatio >= 0.4) {
      contentScore += 7;
      issues.push({
        id: 'crit-action-verbs',
        category: 'content',
        severity: 'warning',
        title: 'Start Bullets with Power Action Verbs',
        description: `Only ${Math.round(actionVerbRatio * 100)}% of your bullet points begin with strong action verbs.`,
        section: 'Experience',
        scoreDelta: 5,
        fixAction: 'Rewrite bullets to begin with verbs like "Spearheaded", "Engineered", "Optimized", "Scaled".'
      });
    } else {
      contentScore += 3;
      issues.push({
        id: 'crit-action-verbs-low',
        category: 'content',
        severity: 'error',
        title: 'Low Action Verb Usage in Bullets',
        description: 'Most applicant tracking systems scan for decisive action verbs to assess candidate autonomy.',
        section: 'Experience',
        scoreDelta: 9,
        fixAction: 'Click "AI Improve" on your bullet points to rephrase them with strong action verbs.'
      });
    }

    // Metric density check
    const metricRatio = bulletsWithMetrics / totalBullets;
    if (metricRatio >= 0.5) {
      contentScore += 12;
    } else if (metricRatio >= 0.25) {
      contentScore += 7;
      issues.push({
        id: 'crit-metrics-low',
        category: 'content',
        severity: 'warning',
        title: 'Include More Quantifiable Results',
        description: `Only ${bulletsWithMetrics} of ${totalBullets} bullets contain numbers, percentages, or financial metrics.`,
        section: 'Experience',
        scoreDelta: 5,
        fixAction: 'Add metrics (e.g. "increased speed 35%", "managed $100K budget", "scaled to 50K users").'
      });
    } else {
      contentScore += 2;
      issues.push({
        id: 'crit-no-metrics',
        category: 'content',
        severity: 'error',
        title: 'Lack of Quantifiable Achievements',
        description: 'Top-scoring ATS resumes provide measurable evidence (%, $, hours saved, volume).',
        section: 'Experience',
        scoreDelta: 10,
        fixAction: 'Use the ResumeCraft AI bullet improver to turn generic tasks into measured achievements.'
      });
    }

    if (weakBulletsCount > 0) {
      contentScore = Math.max(0, contentScore - 4);
      issues.push({
        id: 'crit-weak-phrasing',
        category: 'content',
        severity: 'warning',
        title: 'Passive Phrasing Detected',
        description: `Found ${weakBulletsCount} instances of passive wording like "responsible for" or "assisted with".`,
        section: 'Experience',
        scoreDelta: 4,
        fixAction: 'Replace passive phrases with direct ownership verbs.'
      });
    }
  }

  // 4. EDUCATION EVALUATION
  if (resume.educations.length > 0) {
    completenessScore += 3;
    const hasDegree = resume.educations.some(e => e.degree.trim() && e.school.trim());
    if (hasDegree) completenessScore += 2;
  } else {
    issues.push({
      id: 'crit-edu-missing',
      category: 'completeness',
      severity: 'warning',
      title: 'Education Section Missing',
      description: 'Most company ATS filters require minimum degree or certification verification.',
      section: 'Education',
      scoreDelta: 5,
      fixAction: 'Add your highest degree or relevant coursework.'
    });
  }

  // 5. SKILLS EVALUATION
  const allSkills = resume.skillCategories.flatMap(c => c.skills.map(s => s.trim())).filter(Boolean);
  totalWords += allSkills.length;

  if (allSkills.length >= 8) {
    contentScore += 8;
  } else if (allSkills.length >= 3) {
    contentScore += 4;
    issues.push({
      id: 'crit-skills-low',
      category: 'content',
      severity: 'warning',
      title: 'Expand Skills Inventory',
      description: `You have ${allSkills.length} skills listed. Aim for 8-15 high-demand hard and soft skills.`,
      section: 'Skills',
      scoreDelta: 4,
      fixAction: 'Add more industry-standard technical tools, frameworks, and methodologies.'
    });
  } else {
    issues.push({
      id: 'crit-skills-empty',
      category: 'completeness',
      severity: 'error',
      title: 'Skills Section Empty',
      description: 'ATS scanners heavily match candidate resumes against required technical keywords in this section.',
      section: 'Skills',
      scoreDelta: 8,
      fixAction: 'Add categorized technical skills, tools, and domain proficiencies.'
    });
  }

  // 6. ATS FORMATTING & DESIGN INTEGRITY (Formatting Score - Max 30)
  // Standard typography
  if (['Inter', 'Merriweather', 'Roboto', 'Lora'].includes(resume.design.fontFamily)) {
    formattingScore += 10;
  } else {
    formattingScore += 6;
  }

  // Standard Section Headings
  formattingScore += 10;

  // Single column / clean ATS layout
  if (['simple', 'modern', 'compact'].includes(resume.design.template)) {
    formattingScore += 10;
  } else {
    formattingScore += 7;
  }

  // Total word count sanity check
  if (totalWords > 900) {
    formattingScore = Math.max(0, formattingScore - 5);
    issues.push({
      id: 'crit-length-overflow',
      category: 'formatting',
      severity: 'warning',
      title: 'Resume Might Exceed Standard Page Length',
      description: `Total estimated length is ~${totalWords} words. Aim for 400-750 words to comfortably fit on a clean single page.`,
      section: 'Layout',
      scoreDelta: 5,
      fixAction: 'Trim redundant bullets or reduce line spacing in Design tab.'
    });
  }

  // Compute final overall score (0 - 100)
  const rawScore = contentScore + formattingScore + completenessScore;
  const overallScore = Math.min(100, Math.max(15, rawScore));

  let rating: AtsScoreResult['rating'] = 'Needs Work';
  if (overallScore >= 90) rating = 'Flawless';
  else if (overallScore >= 75) rating = 'ATS Ready';
  else if (overallScore >= 50) rating = 'Good';

  const averageBulletLength = totalBullets > 0 ? Math.round(totalBulletWords / totalBullets) : 0;

  return {
    overallScore,
    contentScore: Math.min(40, contentScore),
    formattingScore: Math.min(30, formattingScore),
    completenessScore: Math.min(30, completenessScore),
    rating,
    issues,
    metrics: {
      wordCount: totalWords,
      actionVerbsCount: actionVerbsFound,
      metricsCount: metricsFound,
      bulletPointsCount: totalBullets,
      averageBulletLength,
      weakWordsCount: weakWordsFound,
    }
  };
}
