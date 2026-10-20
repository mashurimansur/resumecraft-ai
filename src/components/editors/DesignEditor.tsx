import React from 'react';
import { ResumeDesign, ResumeTemplate, FontFamily, FontSize, LineSpacing, PageMargin, SectionSpacing } from '../../types/resume';
import { Palette, Type, Layout, Check } from 'lucide-react';

interface DesignEditorProps {
  design: ResumeDesign;
  onChange: (updated: ResumeDesign) => void;
}

// Curated color swatches for ATS compliant resumes
const CRAFT_SWATCHES = [
  { name: 'Craft Blue', hex: '#3C5AE9' },
  { name: 'Mint Teal', hex: '#48C9B0' },
  { name: 'Rosewood', hex: '#BF5656' },
  { name: 'Amethyst', hex: '#8756BF' },
  { name: 'Magenta', hex: '#BF56BA' },
  { name: 'Classic Black', hex: '#000000' },
];

const FONT_OPTIONS: { id: FontFamily; label: string; desc: string; fontClass: string; fontCss: string }[] = [
  { id: 'Inter', label: 'Inter', desc: 'Clean Sans', fontClass: 'font-inter', fontCss: "'Inter', sans-serif" },
  { id: 'Roboto', label: 'Roboto', desc: 'Modern Sans', fontClass: 'font-roboto', fontCss: "'Roboto', sans-serif" },
  { id: 'Merriweather', label: 'Merriweather', desc: 'Editorial Serif', fontClass: 'font-merriweather', fontCss: "'Merriweather', serif" },
  { id: 'Lora', label: 'Lora', desc: 'Classic Serif', fontClass: 'font-lora', fontCss: "'Lora', serif" },
  { id: 'JetBrains Mono', label: 'JetBrains Mono', desc: 'Technical Mono', fontClass: 'font-jetbrains', fontCss: "'JetBrains Mono', monospace" },
];

export const DesignEditor: React.FC<DesignEditorProps> = ({ design, onChange }) => {
  const update = (field: keyof ResumeDesign, val: any) => {
    onChange({
      ...design,
      [field]: val
    });
  };

  return (
    <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600" />
          <span>Resume Styling & Templates</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          ATS-compliant layouts, typography, and spacing controls.
        </p>
      </div>

      {/* Templates */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-blue-600" />
          <span>ATS Resume Template</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'simple', label: 'Simple', desc: 'Highest ATS Pass Rate' },
            { id: 'modern', label: 'Modern', desc: 'Stylized Accent Header' },
            { id: 'compact', label: 'Compact', desc: 'High Content Density' },
            { id: 'creative', label: 'Creative', desc: 'Editorial Serif Elegance' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => update('template', t.id as ResumeTemplate)}
              className={`p-3 rounded-xl border text-left transition-all ${
                design.template === t.id
                  ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs">{t.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Typography / Font Family */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-blue-600" />
          <span>Font Family</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => update('fontFamily', f.id)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                design.fontFamily === f.id
                  ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`text-xs font-bold truncate ${f.fontClass}`}
                style={{ fontFamily: f.fontCss }}
              >
                {f.label}
              </div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                {f.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors (Curated ATS palette) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Accent Color (ATS Palette)
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {CRAFT_SWATCHES.map((c) => (
            <button
              key={c.hex}
              onClick={() => update('accentColor', c.hex)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative shadow-xs ${
                design.accentColor.toLowerCase() === c.hex.toLowerCase()
                  ? 'ring-2 ring-slate-900 ring-offset-2'
                  : 'border border-slate-200'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            >
              {design.accentColor.toLowerCase() === c.hex.toLowerCase() && (
                <Check className={`w-4 h-4 ${c.hex === '#000000' || c.hex === '#3C5AE9' || c.hex === '#8756BF' ? 'text-white' : 'text-slate-900'}`} />
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <input
              type="color"
              value={design.accentColor}
              onChange={(e) => update('accentColor', e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0"
              title="Custom Hex Color"
            />
            <span className="text-xs font-mono text-slate-600 uppercase font-semibold">{design.accentColor}</span>
          </div>
        </div>
      </div>

      {/* Sizing & Spacing Sliders (Clean 2x2 grid to prevent button text overlap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Font Size</label>
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            {[
              { id: 'sm', label: 'Small' },
              { id: 'base', label: 'Normal' },
              { id: 'lg', label: 'Large' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update('fontSize', s.id as FontSize)}
                className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium text-center transition-all truncate ${
                  design.fontSize === s.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Line Spacing</label>
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            {[
              { id: 'tight', label: 'Tight' },
              { id: 'normal', label: 'Normal' },
              { id: 'relaxed', label: 'Relaxed' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => update('lineSpacing', l.id as LineSpacing)}
                className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium text-center transition-all truncate ${
                  design.lineSpacing === l.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Section Spacing</label>
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            {[
              { id: 'compact', label: 'Compact' },
              { id: 'normal', label: 'Normal' },
              { id: 'spacious', label: 'Spacious' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update('sectionSpacing', s.id as SectionSpacing)}
                className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium text-center transition-all truncate ${
                  (design.sectionSpacing || 'normal') === s.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Page Margins</label>
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            {[
              { id: 'compact', label: 'Compact' },
              { id: 'normal', label: 'Normal' },
              { id: 'spacious', label: 'Spacious' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update('pageMargin', m.id as PageMargin)}
                className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium text-center transition-all truncate ${
                  design.pageMargin === m.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dividers & Uppercase */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <label className="flex items-center gap-2 cursor-pointer text-slate-800">
          <input
            type="checkbox"
            checked={design.showDividers}
            onChange={(e) => update('showDividers', e.target.checked)}
            className="rounded text-blue-600 border-slate-300"
          />
          <span>Show Section Dividers (ATS standard)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-800">
          <input
            type="checkbox"
            checked={design.uppercaseHeaders}
            onChange={(e) => update('uppercaseHeaders', e.target.checked)}
            className="rounded text-blue-600 border-slate-300"
          />
          <span>UPPERCASE Section Headings</span>
        </label>
      </div>
    </div>
  );
};
