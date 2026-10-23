import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Sparkles,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Volume2,
  Wand2,
  Copy,
  Check,
} from 'lucide-react';
import { ReadabilityMetrics } from '../../types/writing';
import { getReadabilityReport } from '../../utils/readability';
import { countWords } from '../../utils/textMetrics';

interface ReadabilityWorkspaceProps {
  initialText?: string;
  onSendToEditor?: (text: string) => void;
}

export const ReadabilityWorkspace: React.FC<ReadabilityWorkspaceProps> = ({
  initialText = '',
  onSendToEditor,
}) => {
  const [text, setText] = useState<string>(
    initialText ||
      `Their are several strategic advantages in order to adopt artificial intelligence in modern workflows. However, implementation should of been planned with strict data governance. The company will definitely effect positive transformation if team leaders align on measurable goals. At this point in time, machine learning algorithms are utilized by researchers to automate repetitive administrative tasks and improve accuracy across various organizational departments.`
  );

  const [report, setReport] = useState<ReadabilityMetrics>(getReadabilityReport(text));
  const [targetTone, setTargetTone] = useState<string>('Formal & Academic');
  const [toneResult, setToneResult] = useState<any>(null);
  const [isToneAnalyzing, setIsToneAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setReport(getReadabilityReport(text));
  }, [text]);

  const handleToneAnalyze = async () => {
    if (!text.trim()) return;
    setIsToneAnalyzing(true);

    try {
      const res = await fetch('/api/tone/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetTone,
        }),
      });

      if (!res.ok) throw new Error('Tone analysis failed');
      const data = await res.json();
      setToneResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsToneAnalyzing(false);
    }
  };

  const handleCopyRewrite = () => {
    if (!toneResult?.rewrittenText) return;
    navigator.clipboard.writeText(toneResult.rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = countWords(text);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2">
          <Gauge className="w-3.5 h-3.5" />
          Clarity &amp; Stylistic Diagnostics
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Readability &amp; Tone Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Measure scholastic grade level, passive constructions, complex word density, and stylistic tone attributes.
        </p>
      </div>

      {/* Input Text Box */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Document Passage for Diagnostics
          </span>
          <span className="text-slate-400">{wordCount} words</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here to inspect readability indices and tone..."
          rows={6}
          className="w-full p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm leading-relaxed outline-none focus:border-cyan-500 resize-y"
          aria-label="Document passage for diagnostics"
        />
      </div>

      {/* Three Major Readability Indices Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Flesch Reading Ease */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Flesch Reading Ease</span>
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">0 - 100</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {report.fleschReadingEase}
            </div>
            <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mt-1">
              {report.readingEaseLabel}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-normal">
            Higher scores indicate text that is easier to read. Scores between 60-70 represent standard plain English.
          </p>
        </div>

        {/* Flesch-Kincaid Grade Level */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Flesch-Kincaid Grade</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">US Schooling</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Grade {report.fleschKincaidGrade}
            </div>
            <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mt-1">
              {report.gradeLevelLabel}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-normal">
            Translates readability into the number of years of formal education required to comfortably understand the text.
          </p>
        </div>

        {/* Gunning Fog Index */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Gunning Fog Index</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Complexity</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {report.gunningFogIndex}
            </div>
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1">
              {report.gunningFogIndex <= 8
                ? 'Accessible to wide public'
                : report.gunningFogIndex <= 12
                ? 'High school reading level'
                : 'Specialized / College academic prose'}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-normal">
            Estimates readability by weighting average sentence length alongside the percentage of polysyllabic words.
          </p>
        </div>
      </div>

      {/* Secondary Metrics & Sentence Complexity */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Avg. Sentence Length</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {report.averageSentenceLength} words
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Recommended: 15-20</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Complex Words (3+ syl)</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {report.complexWordsPercentage}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Lower aids clarity</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Passive Voice</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {report.passiveVoiceCount} instances
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {report.passiveVoicePercentage}% of sentences
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Very Hard Sentences</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {report.veryHardSentencesCount}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">&gt; 25 words long</span>
        </div>
      </div>

      {/* Clarity Suggestions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Pacing &amp; Readability Recommendations
        </h3>
        <ul className="space-y-2">
          {report.suggestions.map((sug, idx) => (
            <li
              key={idx}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tone Analyzer & Target Rewriter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Tone Diagnostics &amp; Stylistic Rewriter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect detected sentiment and rewrite sentences into your designated tone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetTone}
              onChange={(e) => setTargetTone(e.target.value)}
              className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option>Formal & Academic</option>
              <option>Confident & Executive</option>
              <option>Direct & Concise</option>
              <option>Friendly & Approachable</option>
              <option>Persuasive & Compelling</option>
            </select>

            <button
              onClick={handleToneAnalyze}
              disabled={isToneAnalyzing || !text.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isToneAnalyzing ? 'animate-spin' : ''}`} />
              {isToneAnalyzing ? 'Analyzing...' : 'Diagnose Tone'}
            </button>
          </div>
        </div>

        {/* Tone Result Box */}
        {toneResult && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-purple-900 dark:text-purple-200">
                  Dominant Tone: <span className="underline">{toneResult.detectedTone}</span>
                </span>
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  Stylistic Distribution
                </span>
              </div>

              {/* Tone Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {Object.entries(toneResult.toneScores || {}).map(([toneName, score]: [string, any]) => (
                  <div key={toneName} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {score}%
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">{toneName}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewritten Text in Target Tone */}
            {toneResult.rewrittenText && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Rewritten in {targetTone} Tone:
                  </span>
                  <button
                    onClick={handleCopyRewrite}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{toneResult.rewrittenText}"
                </p>
                {onSendToEditor && (
                  <button
                    onClick={() => onSendToEditor(toneResult.rewrittenText)}
                    className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Replace in Live Editor →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
