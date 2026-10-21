import React, { useState, useRef } from 'react';
import { ResumeData } from '../../types/resume';
import { aiParseLinkedInProfile } from '../../services/aiService';
import { extractTextFromPdfOrTextFile } from '../../utils/pdfExtractor';
import {
  X,
  Linkedin,
  FileText,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Wrench,
  User,
  ArrowRight,
  RotateCcw,
  Check
} from 'lucide-react';

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResume: (importedResume: ResumeData) => void;
  currentDesign?: ResumeData['design'];
}

export const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({
  isOpen,
  onClose,
  onApplyResume,
  currentDesign,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [optimizeAts, setOptimizeAts] = useState(true);

  // AI Generation States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Review & Confirmation State
  const [parsedPreview, setParsedPreview] = useState<ResumeData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsExtractingFile(true);
    setErrorMsg(null);

    try {
      const extracted = await extractTextFromPdfOrTextFile(file);
      if (extracted.trim().length > 30) {
        setPastedText(extracted);
      } else {
        setErrorMsg('Teks dalam file tidak dapat diekstrak secara otomatis. Silakan salin & tempel teks langsung pada tab "Salin & Tempel".');
      }
    } catch (err: any) {
      console.warn('File read error:', err);
      setErrorMsg('Gagal membaca file. Coba salin dan tempel teks profil langsung pada tab "Salin & Tempel".');
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleStartAiExtraction = async () => {
    const textToProcess = pastedText.trim();
    if (textToProcess.length < 20) {
      setErrorMsg('Harap masukkan teks profil LinkedIn Anda terlebih dahulu (minimal 20 karakter).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('Membaca dan memetakan struktur profil LinkedIn...');

    try {
      setLoadingStep(
        optimizeAts
          ? 'AI sedang mengekstrak & menyusun bullet points ATS-friendly...'
          : 'AI sedang memetakan data profil ke format resume...'
      );

      const parsed = await aiParseLinkedInProfile(textToProcess, optimizeAts, currentDesign);

      setLoadingStep('Memvalidasi data...');
      setParsedPreview(parsed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses data LinkedIn dengan AI. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (!parsedPreview) return;
    onApplyResume(parsedPreview);
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setParsedPreview(null);
    setPastedText('');
    setSelectedFile(null);
    setErrorMsg(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center shadow-xs">
              <Linkedin className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                Import Profil dari LinkedIn
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  AI Powered
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {parsedPreview
                  ? 'Tinjau data hasil ekstraksi AI sebelum diterapkan ke resume Anda'
                  : 'Salin profil atau upload PDF untuk mengisi resume secara otomatis'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: INPUT & OPTIONS (Shown before parsedPreview) */}
          {!parsedPreview && (
            <>
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'paste'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Salin & Tempel Teks (Rekomendasi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'file'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>Unggah File ("Save to PDF" / Teks)</span>
                </button>
              </div>

              {/* TAB 1: PASTE TEXT */}
              {activeTab === 'paste' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Teks Profil LinkedIn:</span>
                    {pastedText.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPastedText('')}
                        className="text-slate-400 hover:text-rose-600 text-[11px]"
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Tempel teks profil LinkedIn Anda di sini...\n\nContoh yang bisa disalin:\n- Nama & Headline LinkedIn\n- Bagian "About" (Tentang Saya)\n- Bagian "Experience" (Pengalaman Kerja, Perusahaan, Tanggal, Deskripsi)\n- Bagian "Education" & "Skills"\n\nTips: Buka halaman profil LinkedIn Anda -> Tekan Ctrl+A (atau blok teks penting) -> Tekan Ctrl+C -> Tempel di sini.`}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 transition-all resize-y"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      💡 Cukup salin teks apa adanya. AI akan menyaring nama, riwayat kerja, dan pendidikan secara otomatis.
                    </span>
                    <span className="font-mono">{pastedText.length} karakter</span>
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD FILE */}
              {activeTab === 'file' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isExtractingFile ? (
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedFile ? selectedFile.name : 'Klik untuk memilih file PDF atau Teks'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Mendukung file PDF resmi hasil fitur <b>"Save to PDF"</b> LinkedIn atau file .txt
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                    <span className="text-base">📌</span>
                    <div>
                      <span className="font-bold">Cara mengunduh PDF profil resmi dari LinkedIn:</span>
                      <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-amber-900/80">
                        <li>Buka profil LinkedIn Anda di browser komputer.</li>
                        <li>Klik tombol <b>"More"</b> atau <b>"Lainnya"</b> di bagian atas profil Anda.</li>
                        <li>Pilih <b>"Save to PDF"</b> (Simpan ke PDF).</li>
                        <li>Unggah file yang baru saja didownload tersebut di sini.</li>
                      </ol>
                    </div>
                  </div>

                  {pastedText.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-2.5 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        Teks berhasil dibaca dari file (<b>{pastedText.length} karakter</b>). Siap diekstrak dengan AI.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* AI Processing Mode Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mode Pemrosesan AI:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setOptimizeAts(true)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                      optimizeAts
                        ? 'bg-blue-50/70 border-blue-400 text-blue-900 shadow-2xs font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="aiMode"
                      checked={optimizeAts}
                      onChange={() => setOptimizeAts(true)}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        Optimasi ATS Otomatis
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        AI memformat poin pengalaman menjadi bullet points berbasis pencapaian dengan Action Verbs dan metrik ATS.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setOptimizeAts(false)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                      !optimizeAts
                        ? 'bg-blue-50/70 border-blue-400 text-blue-900 shadow-2xs font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="aiMode"
                      checked={!optimizeAts}
                      onChange={() => setOptimizeAts(false)}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Gunakan Teks Asli</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        AI hanya menyusun data ke struktur resume tanpa mengubah gaya kalimat asli profil Anda.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}

          {/* STEP 2: LOADING INDICATOR */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{loadingStep}</h4>
                <p className="text-xs text-slate-400">
                  Proses ini membutuhkan waktu beberapa detik...
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & REVIEW (Shown once parsedPreview is ready) */}
          {parsedPreview && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Profil LinkedIn berhasil diekstrak! Tinjau ringkasan data di bawah ini sebelum diterapkan.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setParsedPreview(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold underline text-[11px]"
                >
                  Ulangi / Edit Input
                </button>
              </div>

              {/* Candidate Card Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {parsedPreview.contact.fullName || 'Nama Tidak Terdeteksi'}
                    </h4>
                    <p className="text-blue-700 font-semibold text-xs">
                      {parsedPreview.contact.jobTitle || 'Headline Profesional'}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                      {parsedPreview.contact.email && <span>📧 {parsedPreview.contact.email}</span>}
                      {parsedPreview.contact.phone && <span>📞 {parsedPreview.contact.phone}</span>}
                      {parsedPreview.contact.location && <span>📍 {parsedPreview.contact.location}</span>}
                      {parsedPreview.contact.linkedin && <span>🔗 {parsedPreview.contact.linkedin}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      {parsedPreview.experiences.length} Pengalaman
                    </span>
                  </div>
                </div>

                {/* Summary */}
                {parsedPreview.summary && (
                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                      Professional Summary:
                    </span>
                    <p className="text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                      "{parsedPreview.summary}"
                    </p>
                  </div>
                )}

                {/* Experiences List */}
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-500" /> Pengalaman Terdeteksi ({parsedPreview.experiences.length}):
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {parsedPreview.experiences.map((exp, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{exp.role}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] font-medium">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                        <ul className="list-disc ml-4 space-y-0.5 text-[11px] text-slate-600">
                          {exp.bullets.slice(0, 3).map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                          {exp.bullets.length > 3 && (
                            <li className="text-slate-400 italic">+{exp.bullets.length - 3} poin lainnya</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-500" /> Pendidikan ({parsedPreview.educations.length}):
                    </span>
                    <div className="space-y-1">
                      {parsedPreview.educations.map((edu, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="font-bold text-slate-800">{edu.school}</div>
                          <div className="text-[11px] text-slate-500">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-slate-500" /> Kategori Skills:
                    </span>
                    <div className="space-y-1">
                      {parsedPreview.skillCategories.map((cat, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="font-bold text-slate-800 text-[11px]">{cat.categoryName}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cat.skills.slice(0, 5).map((s, sIdx) => (
                              <span key={sIdx} className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                            {cat.skills.length > 5 && (
                              <span className="text-[10px] text-slate-400">+{cat.skills.length - 5}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>

          {!parsedPreview ? (
            <button
              type="button"
              disabled={isLoading || isExtractingFile || pastedText.trim().length < 20}
              onClick={handleStartAiExtraction}
              className="px-5 py-2 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ekstrak dengan AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmApply}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Terapkan ke Resume Sekarang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
