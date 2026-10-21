import React, { useRef, useState, useEffect } from 'react';
import { ResumeData, AtsScoreResult } from '../types/resume';
import { Download, Upload, Printer, Bot, ChevronRight, CheckCircle2, XCircle, Loader2, RefreshCw, X, ShieldCheck, Cpu, Check, RotateCcw, Settings, Eye, EyeOff } from 'lucide-react';
import { charlesBloombergResume, sophiaChenTechResume } from '../data/sampleResumes';
import { checkAiStatus, getAiConfig, saveAiConfig, resetAiConfig, AiStatusResult } from '../services/aiService';

interface HeaderProps {
  resume: ResumeData;
  setResume: (data: ResumeData) => void;
  atsScore: AtsScoreResult;
  onOpenScoreTab: () => void;
  onOpenAiSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  resume,
  setResume,
  atsScore,
  onOpenScoreTab
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const aiConfig = getAiConfig();

  const [aiStatus, setAiStatus] = useState<AiStatusResult>({
    status: 'checking',
    message: 'Memeriksa koneksi AI Gateway...',
    model: aiConfig.model,
    baseUrl: aiConfig.baseUrl,
  });
  const [showStatusPopover, setShowStatusPopover] = useState(false);
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [editModel, setEditModel] = useState(aiConfig.model);
  const [editApiKey, setEditApiKey] = useState(aiConfig.apiKey);
  const [editBaseUrl, setEditBaseUrl] = useState(aiConfig.baseUrl);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasBackup, setHasBackup] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('resumecraft_backup_draft');
    } catch {
      return false;
    }
  });

  const handleLoadSample = (sampleData: ResumeData, sampleName: string) => {
    if (resume.id === sampleData.id) return;

    const confirmed = window.confirm(
      `⚠️ PERINGATAN:\n\nMemuat contoh profil "${sampleName}" akan menimpa teks resume yang sedang Anda kerjakan.\n\n` +
      `Draft resume Anda saat ini akan di-backup otomatis agar bisa dipulihkan kembali sewaktu-waktu.\n\n` +
      `Apakah Anda yakin ingin memuat contoh resume ini?`
    );

    if (confirmed) {
      try {
        localStorage.setItem('resumecraft_backup_draft', JSON.stringify(resume));
        setHasBackup(true);
      } catch (e) {
        console.warn('Failed to backup resume:', e);
      }
      setResume(sampleData);
    }
  };

  const handleRestoreBackup = () => {
    try {
      const backupStr = localStorage.getItem('resumecraft_backup_draft');
      if (backupStr) {
        const parsed = JSON.parse(backupStr);
        if (window.confirm('Pulihkan draft resume Anda sebelum memuat contoh?')) {
          setResume(parsed);
          localStorage.removeItem('resumecraft_backup_draft');
          setHasBackup(false);
        }
      }
    } catch (e) {
      alert('Gagal memulihkan draft.');
    }
  };

  const refreshAiStatus = async () => {
    setAiStatus((prev) => ({ ...prev, status: 'checking', message: 'Menguji koneksi...' }));
    const result = await checkAiStatus();
    setAiStatus(result);
    const updated = getAiConfig();
    setEditModel(updated.model);
    setEditApiKey(updated.apiKey);
    setEditBaseUrl(updated.baseUrl);
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    saveAiConfig({
      model: editModel.trim(),
      apiKey: editApiKey.trim(),
      baseUrl: editBaseUrl.trim(),
    });
    setShowConfigEdit(false);
    await refreshAiStatus();
  };

  const handleResetAiConfig = async () => {
    resetAiConfig();
    const def = getAiConfig();
    setEditModel(def.model);
    setEditApiKey(def.apiKey);
    setEditBaseUrl(def.baseUrl);
    setShowConfigEdit(false);
    await refreshAiStatus();
  };

  useEffect(() => {
    refreshAiStatus();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowStatusPopover(false);
      }
    };
    if (showStatusPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusPopover]);


  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${resume.contact.fullName.replace(/\s+/g, '_')}_Resume_ATS.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.contact && parsed.design) {
            setResume(parsed);
          } else {
            alert("Invalid resume JSON structure.");
          }
        } catch {
          alert("Error parsing uploaded file. Please select a valid JSON file.");
        }
      };
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // ATS score indicator style
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    if (score >= 75) return { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-600' };
    if (score >= 50) return { bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
  };

  const badge = getScoreBadge(atsScore.overallScore);

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 sticky top-0 z-50 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Breadcrumbs */}
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs flex-shrink-0 tracking-tighter">
            RC
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-slate-900 text-sm tracking-tight hidden sm:inline whitespace-nowrap">
              ResumeCraft<span className="text-blue-600 font-extrabold ml-0.5">AI</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline flex-shrink-0" />
            <input
              type="text"
              value={resume.title}
              onChange={(e) => setResume({ ...resume, title: e.target.value })}
              className="font-semibold text-slate-800 bg-transparent hover:bg-slate-100 px-1.5 py-0.5 rounded border border-transparent hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:outline-none w-28 sm:w-40 text-xs truncate"
              title="Click to rename resume"
            />
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0" title="Semua perubahan otomatis tersimpan di browser Anda">
              <Check className="w-2.5 h-2.5 text-emerald-600" /> Tersimpan
            </span>
          </div>
        </div>

        {/* Right: Consolidated Controls Toolbar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sample Switcher with Safety Backup & Confirmation */}
          <div className="hidden xl:flex items-center gap-1.5 flex-shrink-0">
            {hasBackup && (
              <button
                onClick={handleRestoreBackup}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Kembalikan draft resume Anda sebelum diganti contoh"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>Pulihkan Draft</span>
              </button>
            )}

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-1.5 hidden 2xl:inline">
                Contoh:
              </span>
              <button
                onClick={() => handleLoadSample(charlesBloombergResume, 'Executive')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  resume.id === charlesBloombergResume.id ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Muat contoh resume profil Executive"
              >
                Executive
              </button>
              <button
                onClick={() => handleLoadSample(sophiaChenTechResume, 'Developer')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  resume.id === sophiaChenTechResume.id ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Muat contoh resume profil Developer"
              >
                Developer
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Reset data resume dan kembalikan ke template default? Draft Anda saat ini akan di-backup.')) {
                    try {
                      localStorage.setItem('resumecraft_backup_draft', JSON.stringify(resume));
                      setHasBackup(true);
                    } catch {}
                    localStorage.removeItem('resumecraft_resume_data_v1');
                    setResume(charlesBloombergResume);
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-200/80 rounded transition-colors"
                title="Reset data ke default"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* ATS Score Pill - Fixed Height & Compact */}
          <button
            onClick={onOpenScoreTab}
            className={`h-8 px-2.5 rounded-full border flex items-center gap-1.5 transition-all hover:shadow-xs active:scale-95 flex-shrink-0 whitespace-nowrap ${badge.bg}`}
            title="Click to open ATS Score Breakdown"
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse flex-shrink-0`} />
            <span className="text-xs font-bold whitespace-nowrap">
              ATS {atsScore.overallScore}
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-white rounded-full text-slate-700 shadow-2xs whitespace-nowrap">
              {atsScore.rating}
            </span>
          </button>

          {/* AI Connection Status Pill - Fixed Height & Compact */}
          <div className="relative flex-shrink-0" ref={popoverRef}>
            <button
              onClick={() => setShowStatusPopover((prev) => !prev)}
              className={`h-8 px-2.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 flex-shrink-0 whitespace-nowrap ${
                aiStatus.status === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : aiStatus.status === 'checking'
                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
              title="Status Koneksi AI Gateway (Klik untuk info & tes ping)"
            >
              {aiStatus.status === 'connected' ? (
                <>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="whitespace-nowrap">AI Connected</span>
                </>
              ) : aiStatus.status === 'checking' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
                  <span className="whitespace-nowrap">Checking AI...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                  <span className="whitespace-nowrap">AI Disconnected</span>
                </>
              )}
            </button>

            {/* Read-Only Status Info Popover */}
            {showStatusPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Status Gateway AI (OpenAI-Compatible)</span>
                  </div>
                  <button
                    onClick={() => setShowStatusPopover(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Status Banner */}
                  <div
                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                      aiStatus.status === 'connected'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : aiStatus.status === 'checking'
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {aiStatus.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : aiStatus.status === 'checking' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        {aiStatus.status === 'connected'
                          ? 'Terhubung (Online)'
                          : aiStatus.status === 'checking'
                          ? 'Sedang Memeriksa...'
                          : 'Terputus / Offline'}
                      </div>
                      <p className="text-[11px] opacity-90 mt-0.5">{aiStatus.message}</p>
                    </div>
                  </div>

                  {!showConfigEdit ? (
                    <>
                      {/* Environment Config Info (Read-Only) */}
                      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 font-sans text-slate-500 font-medium">
                            <Cpu className="w-3.5 h-3.5 text-blue-600" /> Model:
                          </span>
                          <span className="text-blue-700 font-mono font-bold">{aiStatus.model}</span>
                        </div>

                        {aiConfig.isServerAuth && !aiConfig.apiKey && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5 font-sans text-slate-500 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Kredensial:
                            </span>
                            <span className="text-emerald-700 font-sans font-semibold">Tersimpan aman di server</span>
                          </div>
                        )}

                        {aiStatus.latencyMs !== undefined && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5 font-sans text-slate-500 font-medium">
                              ⚡ Latensi:
                            </span>
                            <span className="text-emerald-700 font-mono font-bold">{aiStatus.latencyMs} ms</span>
                          </div>
                        )}
                      </div>

                      {/* Security Note */}
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          Koneksi gateway aman via proxy internal Nginx container.
                        </span>
                      </div>

                      {/* Action: Ping Ulang & Ubah */}
                      <div className="pt-1 flex gap-2">
                        <button
                          onClick={refreshAiStatus}
                          disabled={aiStatus.status === 'checking'}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${aiStatus.status === 'checking' ? 'animate-spin' : ''}`} />
                          <span>Tes Ping</span>
                        </button>
                        <button
                          onClick={() => setShowConfigEdit(true)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                          title="Ubah Model / API Key"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ubah</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* In-app AI Configuration Form */
                    <form onSubmit={handleSaveAiConfig} className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Model AI
                        </label>
                        <input
                          type="text"
                          value={editModel}
                          onChange={(e) => setEditModel(e.target.value)}
                          placeholder="ag/gemini-3.8-flash atau gpt-4o-mini"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-800"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => setEditModel('ag/gemini-3.8-flash')}
                            className="text-[10px] text-blue-600 hover:underline px-1.5 py-0.5 bg-blue-50 rounded"
                          >
                            + ag/gemini-3.8-flash
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditModel('gpt-4o-mini')}
                            className="text-[10px] text-blue-600 hover:underline px-1.5 py-0.5 bg-blue-50 rounded"
                          >
                            + gpt-4o-mini
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          API Key {aiConfig.isServerAuth && <span className="text-emerald-600 font-normal">(Aktif dari container)</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={editApiKey}
                            onChange={(e) => setEditApiKey(e.target.value)}
                            placeholder={aiConfig.isServerAuth ? "Dikelola aman di server (kosongkan jika pakai bawaan)" : "sk-..."}
                            className="w-full px-2.5 py-1.5 pr-8 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                          >
                            {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {aiConfig.isServerAuth && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            ✨ Kredensial container disembunyikan untuk privasi. Masukkan jika ingin override.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Base URL (Opsional)
                        </label>
                        <input
                          type="text"
                          value={editBaseUrl}
                          onChange={(e) => setEditBaseUrl(e.target.value)}
                          placeholder="/api/ai (Default proxy container)"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-800"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          Simpan & Hubungkan
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfigEdit(false)}
                          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="text-center pt-0.5">
                        <button
                          type="button"
                          onClick={handleResetAiConfig}
                          className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          Reset ke Default Container
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block flex-shrink-0" />

          {/* Action Controls */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors flex-shrink-0 whitespace-nowrap"
            title="Import Resume JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleExportJson}
            className="h-8 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors flex-shrink-0 whitespace-nowrap"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
