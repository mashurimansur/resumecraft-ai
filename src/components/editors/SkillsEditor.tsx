import React, { useState } from 'react';
import { SkillCategory } from '../../types/resume';
import { Wrench, Plus, X, Trash2 } from 'lucide-react';

interface SkillsEditorProps {
  categories: SkillCategory[];
  onChange: (updated: SkillCategory[]) => void;
  suggestedKeywords?: string[];
  onAddKeyword?: (keyword: string) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  categories,
  onChange,
  suggestedKeywords = []
}) => {
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: SkillCategory = {
      id: `skill-cat-${Date.now()}`,
      categoryName: newCategoryName.trim(),
      skills: []
    };
    onChange([...categories, newCat]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (catId: string) => {
    onChange(categories.filter(c => c.id !== catId));
  };

  const handleAddSkill = (catId: string) => {
    const skillName = newSkillInputs[catId]?.trim();
    if (!skillName) return;

    onChange(
      categories.map(cat => {
        if (cat.id === catId) {
          if (cat.skills.includes(skillName)) return cat;
          return { ...cat, skills: [...cat.skills, skillName] };
        }
        return cat;
      })
    );

    setNewSkillInputs(prev => ({ ...prev, [catId]: '' }));
  };

  const handleRemoveSkill = (catId: string, skillToRemove: string) => {
    onChange(
      categories.map(cat => {
        if (cat.id === catId) {
          return { ...cat, skills: cat.skills.filter(s => s !== skillToRemove) };
        }
        return cat;
      })
    );
  };

  const handleQuickAddSuggested = (keyword: string) => {
    if (categories.length === 0) {
      const defaultCat: SkillCategory = {
        id: `skill-cat-${Date.now()}`,
        categoryName: 'Core Competencies',
        skills: [keyword]
      };
      onChange([defaultCat]);
      return;
    }

    const firstCat = categories[0];
    if (!firstCat.skills.includes(keyword)) {
      onChange(
        categories.map((cat, idx) => {
          if (idx === 0) {
            return { ...cat, skills: [...cat.skills, keyword] };
          }
          return cat;
        })
      );
    }
  };

  const totalSkills = categories.reduce((acc, cat) => acc + cat.skills.length, 0);

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Expert-Level Skills ({totalSkills})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Group skills into distinct categories (e.g. Leadership, Front End, Technical Tools).
          </p>
        </div>
      </div>

      {/* Suggested Missing Keywords Banner (from Target analysis) */}
      {suggestedKeywords.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
            🎯 Target Job Missing Keywords (1-Click Add):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedKeywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => handleQuickAddSuggested(kw)}
                className="text-xs px-2.5 py-1 rounded-full bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-medium flex items-center gap-1 transition-colors shadow-xs"
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                <span>{kw}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">{cat.categoryName}</span>
              <button
                onClick={() => handleRemoveCategory(cat.id)}
                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {cat.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-800 border border-slate-200 text-xs font-medium shadow-xs"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(cat.id, skill)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInputs[cat.id] || ''}
                onChange={(e) => setNewSkillInputs({ ...newSkillInputs, [cat.id]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(cat.id);
                  }
                }}
                placeholder="Add skill and press Enter..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAddSkill(cat.id)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Category */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New Category (e.g. Tools, Soft Skills, Languages)..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
        />
        <button
          onClick={handleAddCategory}
          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>Add Category</span>
        </button>
      </div>
    </div>
  );
};
