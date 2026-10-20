import React, { useState, useMemo, useRef, useEffect } from 'react';
import { charlesBloombergResume } from './data/sampleResumes';
import { ResumeData } from './types/resume';
import { calculateAtsScore } from './utils/atsScorer';
import { Header } from './components/Header';
import { ResumePreview } from './components/ResumePreview';
import { ContactEditor } from './components/editors/ContactEditor';
import { SummaryEditor } from './components/editors/SummaryEditor';
import { ExperienceEditor } from './components/editors/ExperienceEditor';
import { EducationEditor } from './components/editors/EducationEditor';
import { SkillsEditor } from './components/editors/SkillsEditor';
import { ProjectsEditor } from './components/editors/ProjectsEditor';
import { CertificationsEditor } from './components/editors/CertificationsEditor';
import { DesignEditor } from './components/editors/DesignEditor';
import { ScoreTab } from './components/tabs/ScoreTab';
import { TargetTab } from './components/tabs/TargetTab';
import { CoverLetterTab } from './components/tabs/CoverLetterTab';
import {
  Wrench,
  Target,
  Sparkles,
  Palette,
  Mail,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  FileCheck2,
  Eye,
  Edit3,
  Download
} from 'lucide-react';

type MainTab = 'build' | 'target' | 'score' | 'design' | 'cover';
type BuildSection = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';

const STORAGE_KEY_RESUME = 'resumecraft_resume_data_v1';
const STORAGE_KEY_TAB = 'resumecraft_active_tab';
const STORAGE_KEY_BUILD_SEC = 'resumecraft_active_build_section';

export const App: React.FC = () => {
  // Initialize resume from localStorage if available, otherwise fallback to default sample
  const [resume, setResume] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESUME);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.contact && parsed.design) {
          return {
            ...parsed,
            experiences: parsed.experiences || [],
            educations: parsed.educations || [],
            skillCategories: parsed.skillCategories || [],
            projects: parsed.projects || [],
            certifications: parsed.certifications || []
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load resume from localStorage:', e);
    }
    return charlesBloombergResume;
  });

  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAB);
      if (saved && ['build', 'target', 'score', 'design', 'cover'].includes(saved)) {
        return saved as MainTab;
      }
    } catch {}
    return 'build';
  });

  const [activeBuildSection, setActiveBuildSection] = useState<BuildSection>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUILD_SEC);
      if (saved && ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'].includes(saved)) {
        return saved as BuildSection;
      }
    } catch {}
    return 'contact';
  });

  const [previewScale, setPreviewScale] = useState<number>(0.92);
  const [pageCount, setPageCount] = useState<number>(1);
  const [highlightKeywords, setHighlightKeywords] = useState<string[]>([]);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Auto-save resume changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESUME, JSON.stringify(resume));
    } catch (e) {
      console.warn('Failed to save resume to localStorage:', e);
    }
  }, [resume]);

  // Save active tab preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TAB, activeTab);
    } catch {}
  }, [activeTab]);

  // Save active build section preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUILD_SEC, activeBuildSection);
    } catch {}
  }, [activeBuildSection]);

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (canvasContainerRef.current?.requestFullscreen) {
        canvasContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Compute live ATS score
  const atsScore = useMemo(() => {
    return calculateAtsScore(resume);
  }, [resume]);

  const handleAddSkillFromTarget = (skill: string) => {
    if (resume.skillCategories.length === 0) {
      setResume({
        ...resume,
        skillCategories: [{ id: `skill-cat-${Date.now()}`, categoryName: 'Core Competencies', skills: [skill] }]
      });
      return;
    }

    const firstCat = resume.skillCategories[0];
    if (!firstCat.skills.includes(skill)) {
      setResume({
        ...resume,
        skillCategories: resume.skillCategories.map((cat, i) =>
          i === 0 ? { ...cat, skills: [...cat.skills, skill] } : cat
        )
      });
    }
  };

  const handleAddBulletFromTarget = (newBullet: string) => {
    if (resume.experiences.length > 0) {
      setResume({
        ...resume,
        experiences: resume.experiences.map((exp, i) =>
          i === 0 ? { ...exp, bullets: [newBullet, ...exp.bullets] } : exp
        )
      });
    }
  };

  const handleNavigateToSection = (sectionName: string) => {
    setActiveTab('build');
    const s = sectionName.toLowerCase();
    if (s.includes('contact')) setActiveBuildSection('contact');
    else if (s.includes('summary')) setActiveBuildSection('summary');
    else if (s.includes('experience')) setActiveBuildSection('experience');
    else if (s.includes('education')) setActiveBuildSection('education');
    else if (s.includes('skill')) setActiveBuildSection('skills');
    else if (s.includes('project')) setActiveBuildSection('projects');
    else if (s.includes('certif') || s.includes('train')) setActiveBuildSection('certifications');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        resume={resume}
        setResume={setResume}
        atsScore={atsScore}
        onOpenScoreTab={() => setActiveTab('score')}
      />

      {/* Main Tab Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 py-1.5 sticky top-[57px] z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('build')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'build'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Build</span>
            </button>

            <button
              onClick={() => setActiveTab('score')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'score'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Score ({atsScore.overallScore})</span>
            </button>

            <button
              onClick={() => setActiveTab('target')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'target'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Target</span>
            </button>

            <button
              onClick={() => setActiveTab('design')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'design'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>

            <button
              onClick={() => setActiveTab('cover')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'cover'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>AI Cover Letter</span>
            </button>
          </div>

          {/* Mobile View Toggle */}
          <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setMobileView('editor')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                mobileView === 'editor' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                mobileView === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Area (Dual-Pane) */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Editor & Controls */}
        <section
          className={`lg:col-span-5 space-y-4 ${
            mobileView === 'preview' ? 'hidden lg:block' : 'block'
          } print:hidden`}
        >
          {/* Sub-Section Navigation if on "Build" Tab */}
          {activeTab === 'build' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'contact', label: 'Contact' },
                { id: 'summary', label: 'Summary' },
                { id: 'experience', label: `Experience (${resume.experiences.length})` },
                { id: 'education', label: `Education (${resume.educations.length})` },
                { id: 'skills', label: 'Skills' },
                { id: 'projects', label: `Projects (${resume.projects.length})` },
                { id: 'certifications', label: `Certifications (${resume.certifications?.length || 0})` },
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveBuildSection(sec.id as BuildSection)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    activeBuildSection === sec.id
                      ? 'bg-white text-blue-700 font-bold border border-slate-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}

          {/* Active Tab Component */}
          <div>
            {activeTab === 'build' && (
              <>
                {activeBuildSection === 'contact' && (
                  <ContactEditor
                    contact={resume.contact}
                    onChange={(contact) => setResume({ ...resume, contact })}
                  />
                )}
                {activeBuildSection === 'summary' && (
                  <SummaryEditor
                    summary={resume.summary}
                    jobTitle={resume.contact.jobTitle}
                    skills={resume.skillCategories[0]?.skills || []}
                    onChange={(summary) => setResume({ ...resume, summary })}
                  />
                )}
                {activeBuildSection === 'experience' && (
                  <ExperienceEditor
                    experiences={resume.experiences}
                    onChange={(experiences) => setResume({ ...resume, experiences })}
                  />
                )}
                {activeBuildSection === 'education' && (
                  <EducationEditor
                    educations={resume.educations}
                    onChange={(educations) => setResume({ ...resume, educations })}
                  />
                )}
                {activeBuildSection === 'skills' && (
                  <SkillsEditor
                    categories={resume.skillCategories}
                    onChange={(skillCategories) => setResume({ ...resume, skillCategories })}
                  />
                )}
                {activeBuildSection === 'projects' && (
                  <ProjectsEditor
                    projects={resume.projects}
                    onChange={(projects) => setResume({ ...resume, projects })}
                  />
                )}
                {activeBuildSection === 'certifications' && (
                  <CertificationsEditor
                    certifications={resume.certifications || []}
                    onChange={(certifications) => setResume({ ...resume, certifications })}
                  />
                )}
              </>
            )}

            {activeTab === 'score' && (
              <ScoreTab
                atsScore={atsScore}
                onNavigateToSection={handleNavigateToSection}
              />
            )}

            {activeTab === 'target' && (
              <TargetTab
                resume={resume}
                onAddSkill={handleAddSkillFromTarget}
                onAddBulletPoint={handleAddBulletFromTarget}
                onHighlightKeywords={setHighlightKeywords}
              />
            )}

            {activeTab === 'design' && (
              <DesignEditor
                design={resume.design}
                onChange={(design) => setResume({ ...resume, design })}
              />
            )}

            {activeTab === 'cover' && (
              <CoverLetterTab resume={resume} />
            )}
          </div>
        </section>

        {/* Right Column: ResumeCraft ATS Paper Canvas */}
        <section
          ref={canvasContainerRef}
          className={`${
            isFullscreen
              ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center overflow-y-auto w-screen h-screen'
              : `lg:col-span-7 flex flex-col items-center sticky top-[120px] ${
                  mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
                }`
          } print:block print:col-span-12 print:static print:h-auto print:w-full print:p-0 print:m-0 print:bg-white print:overflow-visible`}
        >
          {/* Canvas Controls Bar */}
          <div
            className={`w-full flex items-center justify-between border px-4 py-2 rounded-xl mb-3 shadow-xs print:hidden transition-all ${
              isFullscreen
                ? 'max-w-4xl bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <FileCheck2 className={`w-4 h-4 ${isFullscreen ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className="font-bold">
                {isFullscreen ? 'Fullscreen Document Preview' : 'ResumeCraft Document Canvas'}
              </span>
              <span className={`text-[11px] hidden sm:inline ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
                &bull; {pageCount === 1 ? '1 Page (A4)' : `${pageCount} Pages (A4)`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreviewScale((prev) => Math.max(0.5, prev - 0.08))}
                className={`p-1.5 rounded transition-colors ${
                  isFullscreen
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span
                className={`text-xs font-mono w-12 text-center font-semibold ${
                  isFullscreen ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                {Math.round(previewScale * 100)}%
              </span>
              <button
                onClick={() => setPreviewScale((prev) => Math.min(1.4, prev + 0.08))}
                className={`p-1.5 rounded transition-colors ${
                  isFullscreen
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewScale(0.92)}
                className={`p-1.5 rounded transition-colors ${
                  isFullscreen
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Reset Zoom to 92%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className={`h-4 w-px mx-1 ${isFullscreen ? 'bg-slate-700' : 'bg-slate-200'}`} />

              <button
                onClick={() => window.print()}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  isFullscreen
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
                title="Download / Print PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              <button
                onClick={handleToggleFullscreen}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  isFullscreen
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen View'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-white" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Paper Container with flex-shrink-0 to prevent squashing and ensure complete multi-page scroll */}
          <div className="w-full flex-shrink-0 flex justify-center pb-12 print:p-0 print:m-0 print:overflow-visible">
            <ResumePreview
              resume={resume}
              scale={previewScale}
              highlightKeywords={highlightKeywords}
              onPageCountChange={setPageCount}
            />
          </div>
        </section>
      </main>
    </div>
  );
};
