import React, { useState } from 'react';
import { ResumeData, TargetAnalysis } from '../../types/resume';
import { Target, Search, CheckCircle2, XCircle, Plus, ThumbsUp, Sparkles, Check } from 'lucide-react';
import { analyzeJobDescription } from '../../utils/aiAssistant';

interface TargetTabProps {
  resume: ResumeData;
  onAddSkill: (skill: string) => void;
  onAddBulletPoint?: (bullet: string) => void;
  onHighlightKeywords: (keywords: string[]) => void;
}

const SAMPLE_JOB_DESCRIPTION = `We are looking for a Senior Software Engineer / Lead to architect and deliver high-throughput, cloud-native web services. 

Requirements & Qualifications:
• 5+ years of experience with TypeScript, React, Node.js, and modern frontend frameworks.
• Experience architecting REST APIs, Microservices, and GraphQL endpoints.
• Hands-on proficiency with Docker, Kubernetes, AWS, and CI/CD automated deployment pipelines.
• Strong background in SQL, PostgreSQL, and distributed caching (Redis).
• Familiarity with System Architecture, SOC2 security compliance, and automated testing (Jest, Cypress).
• Proven track record in Agile, cross-functional leadership, and mentoring junior engineers.`;

export const TargetTab: React.FC<TargetTabProps> = ({
  resume,
  onAddSkill,
  onAddBulletPoint,
  onHighlightKeywords
}) => {
  const [jobTitle, setJobTitle] = useState(resume.contact.jobTitle || 'Senior Software Engineer');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTION);
  const [analysis, setAnalysis] = useState<TargetAnalysis | null>(() =>
    analyzeJobDescription(jobTitle, SAMPLE_JOB_DESCRIPTION, resume)
  );
  const [activeMissingIndex, setActiveMissingIndex] = useState(0);

  const handleRunScan = () => {
    if (!jobDescription.trim()) return;
    const result = analyzeJobDescription(jobTitle, jobDescription, resume);
    setAnalysis(result);
    setActiveMissingIndex(0);
    onHighlightKeywords(result.foundKeywords);
  };

  const handleAddKeywordToSkills = (keyword: string) => {
    onAddSkill(keyword);
    setTimeout(() => {
      const refreshed = analyzeJobDescription(jobTitle, jobDescription, resume);
      setAnalysis(refreshed);
    }, 100);
  };

  const currentMissingKw = analysis?.missingKeywords[activeMissingIndex];

  const handleAddSuggestedBullet = () => {
    if (!currentMissingKw) return;
    const newBullet = `Spearheaded ${currentMissingKw} initiatives across cross-functional squads, increasing operational throughput by 32%.`;
    if (onAddBulletPoint) {
      onAddBulletPoint(newBullet);
    } else {
      handleAddKeywordToSkills(currentMissingKw);
    }

    if (activeMissingIndex < (analysis?.missingKeywords.length || 0) - 1) {
      setActiveMissingIndex(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Input */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">ResumeCraft AI Keyword Targeting</h2>
        </div>
        <p className="text-xs text-slate-500">
          Paste the job description to identify missing ATS keywords and optimize your interview match rate.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer / Product Analyst"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Job Description</label>
              <button
                onClick={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                Load Sample Job Description
              </button>
            </div>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white resize-y"
            />
          </div>

          <button
            onClick={handleRunScan}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
          >
            <Search className="w-4 h-4" />
            <span>Target Job Description</span>
          </button>
        </div>
      </div>

      {/* Analysis Results matching ATS standard DOM */}
      {analysis && (
        <div className="space-y-4">
          {/* Match Score Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                ATS Keyword Match Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">{analysis.matchScore}%</span>
                <span className="text-xs text-slate-500">
                  ({analysis.foundKeywords.length} of {analysis.foundKeywords.length + analysis.missingKeywords.length} keywords matched)
                </span>
              </div>
            </div>

            <div className="w-36">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    analysis.matchScore >= 75
                      ? 'bg-emerald-500'
                      : analysis.matchScore >= 50
                      ? 'bg-blue-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${analysis.matchScore}%` }}
                />
              </div>
              <span className="block text-[10px] text-right text-slate-500 mt-1 font-medium">
                {analysis.matchScore >= 75 ? 'Ready to apply' : 'Add keywords below'}
              </span>
            </div>
          </div>

          {/* Interactive Prompt: "Is this missing keyword relevant to your experience?" */}
          {currentMissingKw && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl shadow-xs">
              <div className="text-xs font-semibold text-blue-900 mb-2">
                Is this missing keyword relevant to your experience?
              </div>
              <div className="inline-block px-3 py-1.5 bg-white text-blue-800 font-bold text-sm rounded-lg border border-blue-200 shadow-xs mb-3">
                {currentMissingKw}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAddSuggestedBullet}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Yes, add bullet point</span>
                </button>

                <button
                  onClick={() => handleAddKeywordToSkills(currentMissingKw)}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Add to Skills
                </button>

                {activeMissingIndex < analysis.missingKeywords.length - 1 && (
                  <button
                    onClick={() => setActiveMissingIndex(prev => prev + 1)}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Found Keywords (Checklist style) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <div className="text-xs font-bold text-slate-900">
                Great work! You're ranking well for these keywords in the job description:
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.foundKeywords.map((kw, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs font-medium text-emerald-950"
                >
                  <span>{kw}</span>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Keywords (Checklist style) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <div className="text-xs font-bold text-slate-900">
                Consider adding the following keywords to your resume:
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.map((kw, i) => (
                <button
                  key={i}
                  onClick={() => handleAddKeywordToSkills(kw)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-xs font-semibold text-slate-800 transition-all shadow-xs group"
                >
                  <Plus className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
