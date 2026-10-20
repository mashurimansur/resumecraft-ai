import React, { useState } from 'react';
import { FileText, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { aiGenerateSummary } from '../../services/aiService';

interface SummaryEditorProps {
  summary: string;
  jobTitle: string;
  skills: string[];
  onChange: (updated: string) => void;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summary,
  jobTitle,
  skills,
  onChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const words = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  const wordStatusColor = words >= 35 && words <= 120 ? 'text-emerald-600' : (words > 0 ? 'text-amber-600' : 'text-slate-400');

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await aiGenerateSummary(jobTitle || 'Industry Professional', 6, skills);
      onChange(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiRefine = async () => {
    setIsGenerating(true);
    try {
      const refined = await aiGenerateSummary(jobTitle || 'Executive & Consultant', 7, skills);
      onChange(refined);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Professional Summary</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Concise 3-4 sentence elevator pitch highlighting key skills & scope.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Auto-generate summary via AI Assistant"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
          </button>

          <button
            onClick={handleAiRefine}
            disabled={isGenerating}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Polish tone for executive ATS impact"
          >
            <Wand2 className="w-3.5 h-3.5 text-slate-500" />
            <span>AI Polish</span>
          </button>
        </div>
      </div>

      <div>
        <textarea
          rows={5}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Results-driven professional with expertise in delivering scalable products, leading cross-functional teams, and optimizing operations..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 resize-y"
        />
        <div className="flex justify-between items-center text-[11px] mt-1.5 font-medium">
          <span className={wordStatusColor}>
            {words} words (Optimal: 40 - 120 words)
          </span>
          <span className="text-slate-400">
            Tip: Avoid first-person pronouns ("I", "my", "we").
          </span>
        </div>
      </div>
    </div>
  );
};
