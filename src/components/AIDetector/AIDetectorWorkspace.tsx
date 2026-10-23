import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  FileText,
  Upload,
  Download,
  RotateCcw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { AIDetectionResult } from '../../types/writing';
import { countWords } from '../../utils/textMetrics';

interface AIDetectorWorkspaceProps {
  initialText?: string;
  onSendToEditor?: (text: string) => void;
}

export const AIDetectorWorkspace: React.FC<AIDetectorWorkspaceProps> = ({
  initialText = '',
  onSendToEditor,
}) => {
  const [text, setText] = useState<string>(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AIDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  const sampleTexts = {
    ai: `Artificial intelligence represents a transformative paradigm in contemporary computational linguistics. In order to optimize neural workflow pipelines, systems leverage multi-layered transformer blocks. Consequently, these architectures systematically process massive token embeddings. It is important to remember that rigorous algorithmic fine-tuning remains indispensable for robust production deployments. Furthermore, cross-entropy loss functions facilitate steady convergence during extended training runs.`,
    human: `I started playing around with neural nets back in college, mostly because my roommate kept bragging about his computer vision project. Honestly, my first model was a total mess—it kept predicting cat pictures as blenders! But after spending three entire weekends debugging the tensor shapes, it finally learned to classify handwriting. That breakthrough convinced me to dive into full-stack AI engineering for real.`,
    mixed: `Neural language models have drastically transformed modern programming workflows. Many software engineers now rely on automated code completion daily. I personally noticed that while it writes boilerplate code very quickly, it often hallucinates library methods that don't even exist! Therefore, careful human code review remains strictly necessary to maintain software security and prevent silent defects.`,
  };

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 30) {
      setError('Please provide at least 30 characters for statistical burstiness & perplexity analysis.');
      return;
    }
    setError(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai-detection/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI detection failed');
      }

      const data: AIDetectionResult = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content || '');
    };
    reader.readAsText(file);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const reportText = `=====================================================
VERITASWRITE AI CONTENT DETECTION REPORT
Analyzed At: ${new Date(result.analyzedAt).toLocaleString()}
Provider Engine: ${result.providerName}
=====================================================

OVERALL AI PROBABILITY: ${result.overallProbability}%
CLASSIFICATION: ${result.classification.toUpperCase()}
BURSTINESS SCORE: ${result.burstinessScore}/100
PERPLEXITY SCORE: ${result.perplexityScore}/100
TOTAL WORDS ANALYZED: ${result.wordCount}

EXPLANATION:
${result.explanation}

LIMITATIONS & SCIENTIFIC NOTICE:
${result.limitationsNotice}

SENTENCE-BY-SENTENCE BREAKDOWN:
${result.sentenceScores
  .map(
    (s, idx) =>
      `[${idx + 1}] (${s.classification.toUpperCase()} - ${s.aiProbability}%)\n"${s.sentence}"\nReasoning: ${s.reasoning}\n`
  )
  .join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veritas-ai-detection-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    if (!result) return;
    navigator.clipboard.writeText(
      `AI Detection: ${result.overallProbability}% (${result.classification}). Analyzed via ${result.providerName}`
    );
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const wordCount = countWords(text);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Probabilistic Authorship Analyzer
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            AI Content Detector
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Identify statistical indicators of AI-generated prose using perplexity, burstiness, and sentence rhythm.
          </p>
        </div>

        {/* Sample Loaders */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load sample:</span>
          <button
            onClick={() => setText(sampleTexts.ai)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900"
          >
            AI Sample
          </button>
          <button
            onClick={() => setText(sampleTexts.human)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900"
          >
            Human Sample
          </button>
          <button
            onClick={() => setText(sampleTexts.mixed)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900"
          >
            Mixed Sample
          </button>
        </div>
      </div>

      {/* Editor & Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your essay, article, or research text here to evaluate AI probability..."
            rows={8}
            className="w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm leading-relaxed outline-none focus:border-indigo-500 resize-y"
            aria-label="Input text for AI detection"
          />

          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>{wordCount.toLocaleString()} words ({text.length} characters)</span>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium">
                <Upload className="w-3.5 h-3.5" />
                Upload file
                <input
                  type="file"
                  accept=".txt,.md,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {text && (
                <button
                  onClick={() => setText('')}
                  className="hover:text-rose-600 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Minimum 30 characters required for statistical significance.
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || text.trim().length < 30}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Perplexity...
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                Analyze AI Likelihood
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Main Meter Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              {/* Score Display */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-md ${
                    result.overallProbability >= 65
                      ? 'bg-rose-600'
                      : result.overallProbability >= 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                >
                  <span className="text-2xl">{result.overallProbability}%</span>
                  <span className="text-[10px] uppercase font-semibold">AI Likelihood</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                      {result.classification === 'human'
                        ? 'Predominantly Human Written'
                        : result.classification === 'ai'
                        ? 'Highly Likely AI-Generated'
                        : 'Mixed Authorship / Hybrid Text'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedReport ? 'Copied' : 'Copy Summary'}
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Report
                </button>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Burstiness Score
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {result.burstinessScore}/100
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Variation in clause pacing
                </span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Perplexity Index
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {result.perplexityScore}/100
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Vocabulary unpredictability
                </span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Sentences Analyzed
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {result.sentenceScores.length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Discrete passage units
                </span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Provider Engine
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  {result.providerName}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Sentence Heatmap View */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Sentence-Level Heatmap
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-500" />
                  Human (&lt;35%)
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded bg-amber-200 dark:bg-amber-950/80 border border-amber-500" />
                  Mixed (36-65%)
                </span>
                <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-200 dark:bg-rose-950/80 border border-rose-500" />
                  AI (&gt;65%)
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed space-x-1">
              {result.sentenceScores.map((sent, idx) => {
                let badgeClass = 'bg-emerald-50 text-slate-800 dark:text-slate-200 hover:bg-emerald-100/70 border-b-2 border-emerald-400';
                if (sent.classification === 'ai') {
                  badgeClass = 'bg-rose-50 text-rose-950 dark:text-rose-200 hover:bg-rose-100 border-b-2 border-rose-500';
                } else if (sent.classification === 'mixed') {
                  badgeClass = 'bg-amber-50 text-amber-950 dark:text-amber-200 hover:bg-amber-100 border-b-2 border-amber-500';
                }

                return (
                  <span
                    key={idx}
                    onClick={() => setActiveSentenceIndex(idx)}
                    className={`cursor-pointer px-1 py-0.5 rounded transition-colors inline ${badgeClass} ${
                      activeSentenceIndex === idx ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    title={`Click to inspect (${sent.aiProbability}% AI probability)`}
                  >
                    {sent.sentence}{' '}
                  </span>
                );
              })}
            </div>

            {/* Sentence Detail Callout */}
            {activeSentenceIndex !== null && result.sentenceScores[activeSentenceIndex] && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Sentence #{activeSentenceIndex + 1} Analysis:</span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      result.sentenceScores[activeSentenceIndex].classification === 'ai'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {result.sentenceScores[activeSentenceIndex].aiProbability}% AI Probability
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "{result.sentenceScores[activeSentenceIndex].sentence}"
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Reasoning:</strong> {result.sentenceScores[activeSentenceIndex].reasoning}
                </p>
              </div>
            )}
          </div>

          {/* Scientific Notice & Limitations */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" />
              Scientific Disclosure & Limitations
            </div>
            <p className="leading-relaxed opacity-90">{result.limitationsNotice}</p>
          </div>
        </div>
      )}
    </div>
  );
};
