import React, { useState } from 'react';
import {
  Search,
  Upload,
  Download,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  FileText,
  ShieldCheck,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { PlagiarismResult } from '../../types/writing';
import { countWords } from '../../utils/textMetrics';

interface PlagiarismWorkspaceProps {
  initialText?: string;
}

export const PlagiarismWorkspace: React.FC<PlagiarismWorkspaceProps> = ({ initialText = '' }) => {
  const [text, setText] = useState<string>(initialText);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleTexts = {
    original: `Our engineering team developed a novel state synchronization protocol optimized for distributed browser runtimes. By partitioning document trees into verifiable causal trees, we reduced network transfer overhead by 42% while retaining deterministic merge resolutions.`,
    matched: `Neural attention mechanisms have revolutionized natural language processing and computer vision applications. By selectively focusing on relevant subsets of input representations, models can capture long-range dependencies effectively. This foundational architecture transformed deep learning benchmarks.`,
  };

  const handleScan = async () => {
    if (!text.trim() || text.trim().length < 40) {
      setError('Please provide at least 40 characters for passage-level similarity verification.');
      return;
    }
    setError(null);
    setIsScanning(true);

    try {
      setScanStep('Dividing text into semantic passages...');
      await new Promise((r) => setTimeout(r, 400));
      setScanStep('Generating passage fingerprints & hashes...');
      await new Promise((r) => setTimeout(r, 400));
      setScanStep('Comparing against scholarly indices and open web corpus...');

      const res = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Plagiarism check failed');
      }

      const data: PlagiarismResult = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setText((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const report = `=====================================================
VERITASWRITE PLAGIARISM & SIMILARITY REPORT
Date: ${new Date(result.checkedAt).toLocaleString()}
Provider Engine: ${result.providerName}
=====================================================

OVERALL SIMILARITY: ${result.overallSimilarity}%
PASSAGES CHECKED: ${result.totalPassagesChecked}
TOTAL WORDS: ${result.wordCount}

MATCHED SOURCES:
${result.sources
  .map(
    (s, idx) =>
      `[${idx + 1}] ${s.title} (${s.domain})\n    Match: ${s.matchPct}% (~${s.matchedWords} words)\n    URL: ${s.url}`
  )
  .join('\n\n')}

MATCHED PASSAGES & ADVISORIES:
${result.matchedPassages
  .map(
    (p, idx) =>
      `[Passage ${idx + 1}] "${p.passage}"\nSource: ${p.sourceTitle} (${p.similarityPct}% match - ${p.matchType})`
  )
  .join('\n\n')}

COVERAGE DISCLAIMER:
${result.coverageDisclaimer}
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veritas-plagiarism-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = countWords(text);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            Originality &amp; Similarity Verification
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Plagiarism Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Compare passages against indexed literature, detect uncredited phrases, and verify citation hygiene.
          </p>
        </div>

        {/* Preset Sample Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load sample:</span>
          <button
            onClick={() => setText(sampleTexts.original)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900"
          >
            Original Sample
          </button>
          <button
            onClick={() => setText(sampleTexts.matched)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900"
          >
            Passage with Matches
          </button>
        </div>
      </div>

      {/* Editor & Input */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text or document excerpts to scan for textual overlap and missing citations..."
          rows={7}
          className="w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm leading-relaxed outline-none focus:border-indigo-500 resize-y"
          aria-label="Plagiarism check text input"
        />

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{wordCount.toLocaleString()} words</span>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium">
              <Upload className="w-3.5 h-3.5" />
              Upload file
              <input type="file" accept=".txt,.md,.doc" onChange={handleFileUpload} className="hidden" />
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

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isScanning ? (
              <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                {scanStep}
              </span>
            ) : (
              'Passage fingerprinting preserves confidentiality during indexing.'
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning || text.trim().length < 40}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-4 h-4" />
            {isScanning ? 'Scanning Corpus...' : 'Check Plagiarism'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Main Similarity Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-md ${
                    result.overallSimilarity >= 25
                      ? 'bg-rose-600'
                      : result.overallSimilarity >= 10
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                >
                  <span className="text-2xl">{result.overallSimilarity}%</span>
                  <span className="text-[10px] uppercase font-semibold">Similarity</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {result.overallSimilarity <= 5
                      ? 'High Originality Confirmed'
                      : result.overallSimilarity <= 15
                      ? 'Low Incidental Similarity'
                      : 'Notable Overlap Detected'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                    {result.overallSimilarity <= 5
                      ? 'No significant textual overlap found across indexed academic and online databases.'
                      : 'Several phrases exhibit close phrasing matches. Check whether proper quotation marks and citations are applied.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Similarity Report
                </button>
              </div>
            </div>

            {/* Matched Sources List */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Matched Sources ({result.sources.length})
              </h4>
              <div className="space-y-2">
                {result.sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {src.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {src.domain}
                        </span>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                      >
                        {src.url} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {src.matchPct}% match
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ~{src.matchedWords} words
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matched Passages Breakdown */}
          {result.matchedPassages.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Passages Flagged for Review
              </h4>
              <div className="space-y-3">
                {result.matchedPassages.map((passage) => (
                  <div
                    key={passage.id}
                    className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-amber-800 dark:text-amber-300">
                        Source: {passage.sourceTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                        {passage.similarityPct}% Match ({passage.matchType})
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic border-l-2 border-amber-500 pl-3">
                      "{passage.passage}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coverage Notice */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-indigo-500" />
              Search &amp; Coverage Scope
            </div>
            <p className="leading-relaxed">{result.coverageDisclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
