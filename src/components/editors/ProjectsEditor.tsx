import React from 'react';
import { ProjectItem } from '../../types/resume';
import { FolderGit2, Plus, Trash2 } from 'lucide-react';

interface ProjectsEditorProps {
  projects: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ projects, onChange }) => {
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      link: '',
      technologies: [],
      bullets: ['']
    };
    onChange([...projects, newProj]);
  };

  const handleRemoveProject = (id: string) => {
    onChange(projects.filter(p => p.id !== id));
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, value: any) => {
    onChange(
      projects.map(p => {
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleUpdateBullet = (projId: string, bIdx: number, val: string) => {
    onChange(
      projects.map(p => {
        if (p.id === projId) {
          const updated = [...p.bullets];
          updated[bIdx] = val;
          return { ...p, bullets: updated };
        }
        return p;
      })
    );
  };

  const handleAddBullet = (projId: string) => {
    onChange(
      projects.map(p => {
        if (p.id === projId) {
          return { ...p, bullets: [...p.bullets, ''] };
        }
        return p;
      })
    );
  };

  const handleRemoveBullet = (projId: string, bIdx: number) => {
    onChange(
      projects.map(p => {
        if (p.id === projId) {
          return { ...p, bullets: p.bullets.filter((_, i) => i !== bIdx) };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>Notable Projects</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key open source or production projects proving technical skill.
          </p>
        </div>

        <button
          onClick={handleAddProject}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No projects added yet. Click "Add Project" to showcase your work.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj, pIdx) => (
            <div key={proj.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">
                  #{pIdx + 1} {proj.name || 'Project'}
                </span>
                <button
                  onClick={() => handleRemoveProject(proj.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => handleUpdateProject(proj.id, 'name', e.target.value)}
                    placeholder="e.g. ATS Engine V2"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Link / Repo URL</label>
                  <input
                    type="text"
                    value={proj.link || ''}
                    onChange={(e) => handleUpdateProject(proj.id, 'link', e.target.value)}
                    placeholder="https://github.com/example/project"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Technologies Used (comma separated)</label>
                  <input
                    type="text"
                    value={proj.technologies.join(', ')}
                    onChange={(e) => handleUpdateProject(proj.id, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g. TypeScript, Node.js, PostgreSQL, OpenAI API"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Brief Description</label>
                  <input
                    type="text"
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                    placeholder="e.g. Proprietary ATS parsing and scoring engine assessing resumes against 23 parameters."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Project Bullets */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-600">Accomplishments & Metrics</span>
                  <button
                    onClick={() => handleAddBullet(proj.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>
                {proj.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => handleUpdateBullet(proj.id, bIdx, e.target.value)}
                      placeholder="e.g. Engineered real-time matching algorithm achieving 99.4% parsing parity..."
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveBullet(proj.id, bIdx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
