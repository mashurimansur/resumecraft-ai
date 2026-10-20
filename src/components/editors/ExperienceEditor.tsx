import React, { useState } from 'react';
import { ExperienceItem } from '../../types/resume';
import { Briefcase, Plus, Trash2, Sparkles, Check, Wand2, Loader2 } from 'lucide-react';
import { aiImproveBullet, aiGenerateRoleBullets } from '../../services/aiService';

interface ExperienceEditorProps {
  experiences: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({ experiences, onChange }) => {
  const [loadingExpId, setLoadingExpId] = useState<string | null>(null);
  const [improvingBulletIndex, setImprovingBulletIndex] = useState<{ expId: string; index: number } | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<{
    expId: string;
    bulletIndex: number;
    original: string;
    improved: string;
    scoreDelta: number;
    reason: string;
  } | null>(null);

  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['']
    };
    onChange([newItem, ...experiences]);
  };

  const handleRemoveExperience = (id: string) => {
    onChange(experiences.filter(item => item.id !== id));
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    onChange(
      experiences.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleAddBullet = (expId: string) => {
    onChange(
      experiences.map(item => {
        if (item.id === expId) {
          return { ...item, bullets: [...item.bullets, ''] };
        }
        return item;
      })
    );
  };

  const handleRemoveBullet = (expId: string, bulletIndex: number) => {
    onChange(
      experiences.map(item => {
        if (item.id === expId) {
          return {
            ...item,
            bullets: item.bullets.filter((_, idx) => idx !== bulletIndex)
          };
        }
        return item;
      })
    );
  };

  const handleUpdateBullet = (expId: string, bulletIndex: number, text: string) => {
    onChange(
      experiences.map(item => {
        if (item.id === expId) {
          const updatedBullets = [...item.bullets];
          updatedBullets[bulletIndex] = text;
          return { ...item, bullets: updatedBullets };
        }
        return item;
      })
    );
  };

  const handleAiImproveBullet = async (expId: string, bulletIndex: number, currentText: string, role?: string, company?: string) => {
    if (!currentText.trim()) return;
    setImprovingBulletIndex({ expId, index: bulletIndex });

    try {
      const result = await aiImproveBullet(currentText, role, company);
      setActiveSuggestion({
        expId,
        bulletIndex,
        original: result.original,
        improved: result.improved,
        scoreDelta: result.scoreDelta,
        reason: result.reason
      });
    } finally {
      setImprovingBulletIndex(null);
    }
  };

  const handleApplyAiImprovement = () => {
    if (!activeSuggestion) return;
    handleUpdateBullet(activeSuggestion.expId, activeSuggestion.bulletIndex, activeSuggestion.improved);
    setActiveSuggestion(null);
  };

  const handleGenerateRoleBullets = async (expId: string, role: string, company: string) => {
    setLoadingExpId(expId);
    try {
      const generated = await aiGenerateRoleBullets(role || 'Professional', company);
      onChange(
        experiences.map(item => {
          if (item.id === expId) {
            const existing = item.bullets.filter(b => b.trim().length > 0);
            return { ...item, bullets: [...existing, ...generated] };
          }
          return item;
        })
      );
    } finally {
      setLoadingExpId(null);
    }
  };

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Professional Experience</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Use strong action verbs and quantified achievements.
          </p>
        </div>

        <button
          onClick={handleAddExperience}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      {/* AI Improvement Modal / Banner */}
      {activeSuggestion && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl shadow-md relative animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-600 text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-900">ResumeCraft AI Bullet Enhancement</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                +{activeSuggestion.scoreDelta} PTS
              </span>
            </div>
            <button
              onClick={() => setActiveSuggestion(null)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <p className="text-[11px] text-blue-800 mb-3 font-medium">
            {activeSuggestion.reason}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Original</span>
              {activeSuggestion.original}
            </div>
            <div className="p-2.5 rounded-lg bg-blue-100/60 border border-blue-300 text-blue-950 font-medium">
              <span className="block text-[10px] font-semibold text-blue-700 uppercase mb-1">ATS Enhanced</span>
              {activeSuggestion.improved}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveSuggestion(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Keep Original
            </button>
            <button
              onClick={handleApplyAiImprovement}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Improvement</span>
            </button>
          </div>
        </div>
      )}

      {experiences.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No experience entries added yet. Click "Add Position" above to begin.
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, expIdx) => (
            <div
              key={exp.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
            >
              {/* Header row */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">
                  #{expIdx + 1} {exp.role ? `${exp.role} at ${exp.company}` : 'Position'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleGenerateRoleBullets(exp.id, exp.role, exp.company)}
                    disabled={loadingExpId === exp.id}
                    className="text-xs px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Generate industry standard bullet points for this role"
                  >
                    {loadingExpId === exp.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-blue-600" />
                    )}
                    <span>{loadingExpId === exp.id ? 'Generating...' : 'AI Generate Bullets'}</span>
                  </button>
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete Position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Position details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                    placeholder="e.g. Acme Corp / Google / Stripe"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Job Role *</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                    placeholder="e.g. CEO & Founder / Senior Developer"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleUpdateExperience(exp.id, 'location', e.target.value)}
                    placeholder="e.g. Seoul, South Korea / New York, NY"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                      placeholder="e.g. August 2015"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">End Date</label>
                      <label className="text-[10px] text-slate-600 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => handleUpdateExperience(exp.id, 'current', e.target.checked)}
                          className="rounded text-blue-600 border-slate-300"
                        />
                        <span>Present</span>
                      </label>
                    </div>
                    {!exp.current ? (
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                        placeholder="e.g. Present"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 italic">
                        Present
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bullet Points */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Accomplishment Bullets ({exp.bullets.length})
                  </span>
                  <button
                    onClick={() => handleAddBullet(exp.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {exp.bullets.map((bullet, bIdx) => {
                    const isImprovingThis =
                      improvingBulletIndex?.expId === exp.id && improvingBulletIndex?.index === bIdx;

                    return (
                      <div key={bIdx} className="flex items-start gap-2 group">
                        <span className="text-slate-400 mt-2 text-xs select-none">&bull;</span>
                        <div className="flex-1 relative">
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                            placeholder="Action verb + Context + Quantifiable Metric..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                          />
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                          <button
                            onClick={() => handleAiImproveBullet(exp.id, bIdx, bullet, exp.role, exp.company)}
                            disabled={!bullet.trim() || isImprovingThis}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded border border-blue-200 transition-colors disabled:opacity-40"
                            title="AI 9router Improve Bullet (Add metrics & power verbs)"
                          >
                            {isImprovingThis ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveBullet(exp.id, bIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
