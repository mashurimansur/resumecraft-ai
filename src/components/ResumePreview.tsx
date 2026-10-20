import React from 'react';
import { ResumeData } from '../types/resume';
import { MapPin, Mail, Phone, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  scale?: number;
  highlightKeywords?: string[];
  onPageCountChange?: (count: number) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  scale = 1,
  highlightKeywords = [],
  onPageCountChange
}) => {
  const { contact, summary, experiences, educations, skillCategories, projects, certifications, design } = resume;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState<number>(0);

  // A4 Height in px at 96 DPI: 297mm * (96 / 25.4) = 1122.52px
  const A4_HEIGHT_PX = 1122.52;

  // Measure content height and calculate required A4 pages
  React.useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        // Vertical padding approximation based on design.pageMargin
        const paddingOffset = design.pageMargin === 'compact' ? 70 : design.pageMargin === 'spacious' ? 120 : 96;
        const totalHeight = contentRef.current.offsetHeight + paddingOffset;
        setContentHeight(totalHeight);
        const pages = Math.max(1, Math.ceil(totalHeight / A4_HEIGHT_PX));
        if (onPageCountChange) {
          onPageCountChange(pages);
        }
      }
    };

    measure();

    let ro: ResizeObserver | null = null;
    if (contentRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(contentRef.current);
    }

    return () => {
      if (ro) ro.disconnect();
    };
  }, [resume, design.pageMargin, onPageCountChange]);

  const pageCount = Math.max(1, Math.ceil((contentHeight || 1) / A4_HEIGHT_PX));
  const totalMinHeightPx = pageCount * A4_HEIGHT_PX;

  // Font family mapping
  const fontClass = {
    'Inter': 'font-inter',
    'Roboto': 'font-roboto',
    'Merriweather': 'font-merriweather',
    'Lora': 'font-lora',
    'JetBrains Mono': 'font-jetbrains'
  }[design.fontFamily] || 'font-inter';

  // Explicit font-family CSS value ensuring 100% font rendering fidelity across preview, print, and PDF
  const fontCssFamily = {
    'Inter': "'Inter', system-ui, -apple-system, sans-serif",
    'Roboto': "'Roboto', system-ui, -apple-system, sans-serif",
    'Merriweather': "'Merriweather', Georgia, serif",
    'Lora': "'Lora', Georgia, serif",
    'JetBrains Mono': "'JetBrains Mono', monospace",
  }[design.fontFamily] || "'Inter', system-ui, sans-serif";

  // Base sizing
  const sizeClasses = {
    sm: {
      name: 'text-2xl',
      title: 'text-xs',
      contact: 'text-[11px]',
      heading: 'text-xs',
      body: 'text-[11.5px]',
      meta: 'text-[11px]',
      gap: 'space-y-2.5',
      sectionGap: 'mb-3.5',
    },
    base: {
      name: 'text-3xl',
      title: 'text-sm',
      contact: 'text-xs',
      heading: 'text-sm',
      body: 'text-[12.5px]',
      meta: 'text-xs',
      gap: 'space-y-3',
      sectionGap: 'mb-5',
    },
    lg: {
      name: 'text-4xl',
      title: 'text-base',
      contact: 'text-sm',
      heading: 'text-base',
      body: 'text-[13.5px]',
      meta: 'text-xs',
      gap: 'space-y-4',
      sectionGap: 'mb-6',
    }
  }[design.fontSize];

  // Dedicated section spacing class (compact: 14px / mb-3.5, normal: 20px / mb-5, spacious: 28px / mb-7)
  const sectionSpacingClass = {
    compact: 'mb-3.5',
    normal: 'mb-5',
    spacious: 'mb-7',
  }[design.sectionSpacing || 'normal'];

  // Margin padding
  const marginPadding = {
    compact: 'p-8 sm:p-10',
    normal: 'p-10 sm:p-12',
    spacious: 'p-12 sm:p-16'
  }[design.pageMargin];

  // Line spacing
  const lineSpacingClass = {
    tight: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed'
  }[design.lineSpacing];

  // Keyword highlighting helper
  const renderTextWithHighlights = (text: string) => {
    if (!highlightKeywords || highlightKeywords.length === 0) return text;

    const regex = new RegExp(`(${highlightKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isMatch = highlightKeywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark key={i} className="bg-emerald-100 text-emerald-900 font-semibold px-1 rounded mx-0.5">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full flex justify-center py-4 px-2 print:p-0 print:m-0 print:block">
      {/* Zoom container matching the scaled bounding box to eliminate blank overflow */}
      <div
        className="resume-zoom-wrapper"
        style={{
          width: `${210 * scale}mm`,
          height: `${totalMinHeightPx * scale}px`,
          position: 'relative',
          transition: 'width 0.15s ease, height 0.15s ease',
        }}
      >
        {/* A4 Resume Canvas */}
        <div
          id="resume-printable-document"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '210mm',
            minHeight: `${pageCount * 297}mm`,
            boxSizing: 'border-box',
            fontFamily: fontCssFamily,
          }}
          className={`relative bg-white text-slate-900 shadow-xl print:shadow-none border border-slate-200/90 print:border-none print:m-0 transition-all duration-150 ${marginPadding} ${fontClass} ${lineSpacingClass}`}
        >
          {/* Visual A4 Page Cutoff Guides (screen only) */}
          {pageCount > 1 &&
            Array.from({ length: pageCount - 1 }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <div
                  key={pageNum}
                  className="absolute left-0 right-0 pointer-events-none flex items-center justify-center print:hidden z-20"
                  style={{ top: `${pageNum * 297}mm`, transform: 'translateY(-50%)' }}
                >
                  <div className="w-full border-b-2 border-dashed border-red-300 relative flex items-center justify-center">
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                      Page {pageNum} Cutoff &bull; A4 End
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Inner Content Wrapper for Exact Dimension Measurement */}
          <div ref={contentRef} className="w-full">
            {/* HEADER / CONTACT */}
            <div
              className={`resume-contact-header pb-3 ${sectionSpacingClass}`}
              style={{
                borderBottom: design.showDividers ? `1.5px solid ${design.accentColor || '#3C5AE9'}` : 'none'
              }}
            >
          <div className="flex justify-between items-start">
            <div className="w-full">
              <h1 className={`${sizeClasses.name} font-bold tracking-tight text-slate-900`}>
                {contact.fullName || 'Your Full Name'}
              </h1>
              {contact.jobTitle && (
                <p className={`${sizeClasses.title} font-semibold tracking-wide mt-0.5`} style={{ color: design.accentColor || '#3C5AE9' }}>
                  {contact.jobTitle}
                </p>
              )}

              {/* Contact row with vector icons */}
              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 ${sizeClasses.contact} text-slate-600`}>
                {contact.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contact.location}</span>
                  </span>
                )}
                {contact.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contact.phone}</span>
                  </span>
                )}
                {contact.linkedin && (
                  <span className="flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hover:underline">{contact.linkedin}</span>
                  </span>
                )}
                {contact.github && (
                  <span className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hover:underline">{contact.github}</span>
                  </span>
                )}
                {contact.website && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hover:underline">{contact.website}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Optional Photo */}
            {contact.showPhoto && contact.photoUrl && (
              <div className="ml-4 flex-shrink-0">
                <img
                  src={contact.photoUrl}
                  alt={contact.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* PROFESSIONAL SUMMARY */}
        {summary && summary.trim() && (
          <section className={`resume-section ${sectionSpacingClass} last:mb-0`}>
            <h2
              className={`${sizeClasses.heading} font-bold ${design.uppercaseHeaders ? 'uppercase tracking-wider' : ''} text-slate-900 border-b pb-1 mb-2`}
              style={{
                borderColor: design.showDividers ? '#e2e8f0' : 'transparent',
                color: design.template === 'modern' ? design.accentColor : '#0f172a'
              }}
            >
              Professional Summary
            </h2>
            <p className={`${sizeClasses.body} text-slate-700 leading-relaxed text-justify`}>
              {renderTextWithHighlights(summary)}
            </p>
          </section>
        )}

        {/* WORK EXPERIENCE */}
        {experiences && experiences.length > 0 && (
          <section className={`resume-section ${sectionSpacingClass} last:mb-0`}>
            <h2
              className={`${sizeClasses.heading} font-bold ${design.uppercaseHeaders ? 'uppercase tracking-wider' : ''} text-slate-900 border-b pb-1 mb-2`}
              style={{
                borderColor: design.showDividers ? '#e2e8f0' : 'transparent',
                color: design.template === 'modern' ? design.accentColor : '#0f172a'
              }}
            >
              Professional Experience
            </h2>
            <div className={sizeClasses.gap}>
              {experiences.map((exp) => (
                <div key={exp.id} className="resume-item-block">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                      <span className="text-slate-600 font-medium text-sm"> | {exp.company}</span>
                    </div>
                    <div className={`${sizeClasses.meta} font-medium text-slate-500 whitespace-nowrap`}>
                      {exp.startDate} &mdash; {exp.current ? 'Present' : exp.endDate} {exp.location && `, ${exp.location}`}
                    </div>
                  </div>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className={`mt-1.5 list-disc list-outside ml-4 ${sizeClasses.body} text-slate-700 space-y-1`}>
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="pl-1">
                          {renderTextWithHighlights(bullet)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {educations && educations.length > 0 && (
          <section className={`resume-section ${sectionSpacingClass} last:mb-0`}>
            <h2
              className={`${sizeClasses.heading} font-bold ${design.uppercaseHeaders ? 'uppercase tracking-wider' : ''} text-slate-900 border-b pb-1 mb-2`}
              style={{
                borderColor: design.showDividers ? '#e2e8f0' : 'transparent',
                color: design.template === 'modern' ? design.accentColor : '#0f172a'
              }}
            >
              Education
            </h2>
            <div className={sizeClasses.gap}>
              {educations.map((edu) => (
                <div key={edu.id} className="resume-item-block flex justify-between items-baseline flex-wrap gap-1">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </span>
                    <span className="text-slate-600 font-medium text-sm"> | {edu.school}</span>
                    {edu.gpa && <span className="text-slate-500 text-xs ml-2 font-normal">(GPA: {edu.gpa})</span>}
                    {edu.honors && <p className="text-xs text-slate-500 italic mt-0.5">{edu.honors}</p>}
                  </div>
                  <div className={`${sizeClasses.meta} text-slate-500 whitespace-nowrap`}>
                    {edu.startDate} &mdash; {edu.endDate} {edu.location && `, ${edu.location}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS */}
        {skillCategories && skillCategories.length > 0 && (
          <section className={`resume-section ${sectionSpacingClass} last:mb-0`}>
            <h2
              className={`${sizeClasses.heading} font-bold ${design.uppercaseHeaders ? 'uppercase tracking-wider' : ''} text-slate-900 border-b pb-1 mb-2`}
              style={{
                borderColor: design.showDividers ? '#e2e8f0' : 'transparent',
                color: design.template === 'modern' ? design.accentColor : '#0f172a'
              }}
            >
              Expert-Level Skills
            </h2>
            <div className="space-y-1.5">
              {skillCategories.map((cat) => (
                <div key={cat.id} className={`${sizeClasses.body} text-slate-700`}>
                  <strong className="font-semibold text-slate-900">{cat.categoryName}: </strong>
                  <span>
                    {cat.skills.map((s, idx) => (
                      <span key={idx}>
                        {renderTextWithHighlights(s)}
                        {idx < cat.skills.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {projects && projects.length > 0 && (
          <section className={`resume-section ${sectionSpacingClass} last:mb-0`}>
            <h2
              className={`${sizeClasses.heading} font-bold ${design.uppercaseHeaders ? 'uppercase tracking-wider' : ''} text-slate-900 border-b pb-1 mb-2`}
              style={{
                borderColor: design.showDividers ? '#e2e8f0' : 'transparent',
                color: design.template === 'modern' ? design.accentColor : '#0f172a'
              }}
            >
              Notable Projects
            </h2>
            <div className={sizeClasses.gap}>
              {projects.map((proj) => (
                <div key={proj.id} className="resume-item-block">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{proj.name}</span>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-blue-600 print:hidden"
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-xs text-slate-500 font-medium">
                        [{proj.technologies.join(', ')}]
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className={`${sizeClasses.body} text-slate-600 mt-0.5`}>
                      {renderTextWithHighlights(proj.description)}
                    </p>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className={`mt-1 list-disc list-outside ml-4 ${sizeClasses.body} text-slate-700 space-y-0.5`}>
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="pl-1">
                          {renderTextWithHighlights(b)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {certifications && certifications.length > 0 && (
          <section className={`resume-section ${sectionSpacingClass} last:mb-0`}>
            <h2
              className={`${sizeClasses.heading} font-bold ${design.uppercaseHeaders ? 'uppercase tracking-wider' : ''} text-slate-900 border-b pb-1 mb-2`}
              style={{
                borderColor: design.showDividers ? '#e2e8f0' : 'transparent',
                color: design.template === 'modern' ? design.accentColor : '#0f172a'
              }}
            >
              Certifications & Training
            </h2>
            <div className="space-y-1">
              {certifications.map((cert) => (
                <div key={cert.id} className={`resume-item-block flex justify-between items-baseline ${sizeClasses.body} text-slate-700`}>
                  <div className="flex items-center gap-1.5">
                    <strong className="font-semibold text-slate-900">{cert.name}</strong>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600 print:hidden"
                        title="View Credential"
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    )}
                    <span>&mdash; {cert.issuer}</span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};
