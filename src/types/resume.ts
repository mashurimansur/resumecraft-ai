export interface ContactInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  photoUrl?: string;
  showPhoto: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link?: string;
  technologies: string[];
  bullets: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export type ResumeTemplate = 'simple' | 'modern' | 'compact' | 'creative';
export type FontFamily = 'Inter' | 'Merriweather' | 'Roboto' | 'Lora' | 'JetBrains Mono';
export type FontSize = 'sm' | 'base' | 'lg';
export type LineSpacing = 'tight' | 'normal' | 'relaxed';
export type PageMargin = 'compact' | 'normal' | 'spacious';
export type SectionSpacing = 'compact' | 'normal' | 'spacious';
export type DividerStyle = 'solid' | 'dashed' | 'subtle' | 'none';

export interface ResumeDesign {
  template: ResumeTemplate;
  fontFamily: FontFamily;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  pageMargin: PageMargin;
  sectionSpacing?: SectionSpacing;
  accentColor: string;
  showDividers: boolean;
  dividerStyle: DividerStyle;
  uppercaseHeaders: boolean;
}

export interface ResumeData {
  id: string;
  title: string;
  updatedAt: string;
  contact: ContactInfo;
  summary: string;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  design: ResumeDesign;
}

export interface ScoreIssue {
  id: string;
  category: 'content' | 'formatting' | 'completeness' | 'ats';
  severity: 'error' | 'warning' | 'tip';
  title: string;
  description: string;
  section: string;
  scoreDelta: number;
  fixAction?: string;
}

export interface AtsScoreResult {
  overallScore: number;
  contentScore: number;
  formattingScore: number;
  completenessScore: number;
  rating: 'Needs Work' | 'Good' | 'ATS Ready' | 'Flawless';
  issues: ScoreIssue[];
  metrics: {
    wordCount: number;
    actionVerbsCount: number;
    metricsCount: number;
    bulletPointsCount: number;
    averageBulletLength: number;
    weakWordsCount: number;
  };
}

export interface TargetAnalysis {
  jobTitle: string;
  targetCompany: string;
  jobDescription: string;
  matchScore: number;
  foundKeywords: string[];
  missingKeywords: string[];
  recommendedKeywords: string[];
}
