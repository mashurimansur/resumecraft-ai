import React from 'react';
import { ContactInfo } from '../../types/resume';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface ContactEditorProps {
  contact: ContactInfo;
  onChange: (updated: ContactInfo) => void;
}

export const ContactEditor: React.FC<ContactEditorProps> = ({ contact, onChange }) => {
  const handleChange = (field: keyof ContactInfo, value: any) => {
    onChange({
      ...contact,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>Contact Details</span>
        </h3>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ATS Required
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={contact.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="e.g. Charles Bloomberg"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Professional Title *</label>
          <input
            type="text"
            value={contact.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            placeholder="e.g. CEO & Founder / Senior Developer"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Email Address *</span>
          </label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="charlesbloomberg@gmail.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Phone Number *</span>
          </label>
          <input
            type="text"
            value={contact.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(621) 799-5548"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Location (City, Country/State) *</span>
          </label>
          <input
            type="text"
            value={contact.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g. Seoul, South Korea"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-slate-400" />
            <span>LinkedIn Profile URL</span>
          </label>
          <input
            type="text"
            value={contact.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="in/cbloomberg"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span>GitHub Profile</span>
          </label>
          <input
            type="text"
            value={contact.github}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="github.com/cbloomberg"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Personal Portfolio</span>
          </label>
          <input
            type="text"
            value={contact.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="charlesbloomberg.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Photo toggle (ATS compliance guidance) */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-800">Profile Photo</span>
          <p className="text-[11px] text-slate-500">
            ATS recommendation: Keep disabled for ATS compliance to prevent recruiter bias filters.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={contact.showPhoto}
            onChange={(e) => handleChange('showPhoto', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {contact.showPhoto && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Image URL</label>
          <input
            type="text"
            value={contact.photoUrl || ''}
            onChange={(e) => handleChange('photoUrl', e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      )}
    </div>
  );
};
