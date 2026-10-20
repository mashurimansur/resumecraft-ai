import React from 'react';
import { CertificationItem } from '../../types/resume';
import { Award, Plus, Trash2, ExternalLink, Calendar, Building, Sparkles } from 'lucide-react';

interface CertificationsEditorProps {
  certifications: CertificationItem[];
  onChange: (updated: CertificationItem[]) => void;
}

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({ certifications, onChange }) => {
  const handleAddCertification = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: new Date().getFullYear().toString(),
      url: ''
    };
    onChange([...certifications, newItem]);
  };

  const handleRemoveCertification = (id: string) => {
    onChange(certifications.filter(item => item.id !== id));
  };

  const handleUpdateCertification = (id: string, field: keyof CertificationItem, value: any) => {
    onChange(
      certifications.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Popular quick templates to help user easily add common certifications
  const quickPresets = [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
    { name: 'Google Cloud Professional Cloud Architect', issuer: 'Google Cloud' },
    { name: 'Project Management Professional (PMP)', issuer: 'PMI' },
    { name: 'Certified ScrumMaster (CSM)', issuer: 'Scrum Alliance' }
  ];

  const handleAddPreset = (preset: { name: string; issuer: string }) => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: preset.name,
      issuer: preset.issuer,
      date: new Date().getFullYear().toString(),
      url: ''
    };
    onChange([...certifications, newItem]);
  };

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Certifications & Training</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Licenses, professional credentials, and verified online certifications.
          </p>
        </div>

        <button
          onClick={handleAddCertification}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certificate</span>
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">No certifications added yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
              Adding verified credentials can boost your ATS interview callback rate by up to 24%.
            </p>
          </div>

          {/* Quick preset suggestions */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Popular Presets (Click to add):
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
              {quickPresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] text-slate-600 border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert, idx) => (
            <div
              key={cert.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 relative group"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{cert.name || 'Untitled Certification'}</span>
                  {cert.issuer && (
                    <span className="text-slate-400 font-normal">&bull; {cert.issuer}</span>
                  )}
                </span>
                <button
                  onClick={() => handleRemoveCertification(cert.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleUpdateCertification(cert.id, 'name', e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>Issuing Organization *</span>
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleUpdateCertification(cert.id, 'issuer', e.target.value)}
                    placeholder="e.g. Amazon Web Services / Google / Coursera"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Issue Date / Year</span>
                  </label>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleUpdateCertification(cert.id, 'date', e.target.value)}
                    placeholder="e.g. 2023 or Oct 2023"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>Credential URL / Verification Link</span>
                  </label>
                  <input
                    type="text"
                    value={cert.url || ''}
                    onChange={(e) => handleUpdateCertification(cert.id, 'url', e.target.value)}
                    placeholder="https://credly.com/badges/..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
