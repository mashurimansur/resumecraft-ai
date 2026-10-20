import React from 'react';
import { EducationItem } from '../../types/resume';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

interface EducationEditorProps {
  educations: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ educations, onChange }) => {
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      school: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: ''
    };
    onChange([...educations, newItem]);
  };

  const handleRemoveEducation = (id: string) => {
    onChange(educations.filter(item => item.id !== id));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, value: any) => {
    onChange(
      educations.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Education</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Degrees, academic honors, and university details.
          </p>
        </div>

        <button
          onClick={handleAddEducation}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </button>
      </div>

      {educations.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No education entries added yet. Click "Add Education" to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {educations.map((edu, idx) => (
            <div
              key={edu.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 relative group"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">
                  #{idx + 1} {edu.degree ? `${edu.degree} - ${edu.school}` : 'Degree Entry'}
                </span>
                <button
                  onClick={() => handleRemoveEducation(edu.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">School / University *</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                    placeholder="e.g. University of Wisconsin - Madison"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Degree *</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="e.g. Bachelor of Science"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) => handleUpdateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                    placeholder="e.g. Economics / Computer Science"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => handleUpdateEducation(edu.id, 'location', e.target.value)}
                    placeholder="e.g. Madison, WI"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                      placeholder="e.g. 2014"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">GPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, 'gpa', e.target.value)}
                      placeholder="e.g. 3.82"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Honors / Awards</label>
                  <input
                    type="text"
                    value={edu.honors || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'honors', e.target.value)}
                    placeholder="e.g. Powers-Knapp Scholar, Dean's List"
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
