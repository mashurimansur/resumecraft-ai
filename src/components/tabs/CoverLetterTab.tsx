import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import { Mail, Sparkles, Copy, Check, Download, Loader2 } from 'lucide-react';
import { aiGenerateCoverLetter } from '../../services/aiService';

interface CoverLetterTabProps {
  resume: ResumeData;
}

export const CoverLetterTab: React.FC<CoverLetterTabProps> = ({ resume }) => {
  const [targetCompany, setTargetCompany] = useState('Acme Corp');
  const [targetRole, setTargetRole] = useState(resume.contact.jobTitle || 'Senior Software Engineer');
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initial load
  React.useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generated = await aiGenerateCoverLetter(resume, targetRole, targetCompany);
      setCoverLetter(generated);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${resume.contact.fullName.replace(/\s+/g, '_')}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>AI Cover Letter Generator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generate a tailored cover letter powered by 9router AI.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isLoading ? 'Generating...' : 'Regenerate'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company</label>
          <input
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="e.g. Stripe / Apple / Netflix"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Lead Engineer"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={16}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-blue-500 focus:bg-white resize-y"
        />

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
