import React from 'react';
import { AtsScoreResult } from '../../types/resume';
import { Sparkles, AlertCircle, AlertTriangle, CheckCircle2, Zap, ArrowRight, Check } from 'lucide-react';

interface ScoreTabProps {
  atsScore: AtsScoreResult;
  onNavigateToSection?: (section: string) => void;
}

export const ScoreTab: React.FC<ScoreTabProps> = ({ atsScore, onNavigateToSection }) => {
  const { overallScore, rating, issues, metrics } = atsScore;

  // 5-ring ATS sub-scores
  const contentRing = Math.min(100, Math.round((atsScore.contentScore / 40) * 100));
  const formatRing = Math.min(100, Math.round((atsScore.formattingScore / 30) * 100));
  const optimizationRing = Math.min(100, Math.round(((metrics.metricsCount * 20 + metrics.actionVerbsCount * 10) / (Math.max(1, metrics.bulletPointsCount * 30))) * 100));
  const bestPracticesRing = Math.min(100, Math.round((atsScore.completenessScore / 30) * 100));
  const applicationReadyRing = Math.min(100, Math.round((overallScore * 0.95)));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 60) return 'text-blue-600 stroke-blue-600';
    if (score >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getRingColor = (score: number) => {
    if (score >= 70) return '#14B8A6'; // Teal/Green
    if (score >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const subRings = [
    { label: 'Content', score: contentRing, desc: 'Bullet impact & verbs' },
    { label: 'Format', score: formatRing, desc: 'Typography & structure' },
    { label: 'Optimization', score: optimizationRing, desc: 'Metrics & numbers' },
    { label: 'Best Practices', score: bestPracticesRing, desc: 'Completeness check' },
    { label: 'Application Ready', score: applicationReadyRing, desc: 'ATS compliance' },
  ];

  return (
    <div className="space-y-6">
      {/* ATS Score Hero Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            {/* Donut Progress Meter */}
            <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`transition-all duration-1000 ease-out ${getScoreColor(overallScore)}`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{overallScore}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">/ 100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                  {rating}
                </span>
                <span className="text-xs text-slate-500 font-medium">ResumeCraft Score &trade;</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {overallScore >= 90
                  ? 'Excellent! Your resume is in the top 5% of ATS applications.'
                  : overallScore >= 75
                  ? 'Strong resume ready for employer callbacks.'
                  : overallScore >= 50
                  ? 'Needs improvement. Make the suggested adjustments below.'
                  : 'Low ATS readiness. Follow the checklist below to optimize.'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md">
                Improve your ATS score by making suggested adjustments in each category.
              </p>
            </div>
          </div>
        </div>

        {/* 5-Category ATS Rings */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
          {subRings.map((r, i) => (
            <div key={i} className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    className="stroke-slate-200"
                    strokeWidth="3.2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    style={{ stroke: getRingColor(r.score) }}
                    strokeWidth="3.2"
                    strokeDasharray={`${r.score}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-800">{r.score}</span>
              </div>
              <span className="text-xs font-bold text-slate-900">{r.label}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ATS Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-2xl font-bold text-blue-600">{metrics.actionVerbsCount}</span>
          <span className="text-xs font-semibold text-slate-600">Action Verbs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-2xl font-bold text-emerald-600">{metrics.metricsCount}</span>
          <span className="text-xs font-semibold text-slate-600">Measured Outcomes (%, $)</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-2xl font-bold text-slate-900">{metrics.wordCount}</span>
          <span className="text-xs font-semibold text-slate-600">Word Count</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-2xl font-bold text-slate-900">{metrics.bulletPointsCount}</span>
          <span className="text-xs font-semibold text-slate-600">Bullet Points</span>
        </div>
      </div>

      {/* Issues & Opportunities Checklist */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Optimization Checklist ({issues.length} items)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click to resolve in editor</span>
        </div>

        {issues.length === 0 ? (
          <div className="py-8 text-center text-emerald-600 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8" />
            <p className="text-sm font-bold">Outstanding! No critical ATS issues found.</p>
            <p className="text-xs text-slate-500">Your resume satisfies all 23 key ATS guidelines.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  issue.severity === 'error'
                    ? 'bg-rose-50/60 border-rose-200'
                    : issue.severity === 'warning'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-blue-50/60 border-blue-200'
                }`}
              >
                <div className="mt-0.5">
                  {issue.severity === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-xs">
                      +{issue.scoreDelta} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{issue.description}</p>
                  {issue.fixAction && (
                    <p className="text-[11px] text-blue-700 font-medium mt-1.5 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-blue-600" />
                      <span>{issue.fixAction}</span>
                    </p>
                  )}
                </div>

                {onNavigateToSection && (
                  <button
                    onClick={() => onNavigateToSection(issue.section)}
                    className="text-xs px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold shadow-xs whitespace-nowrap self-center transition-colors"
                  >
                    Fix
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
