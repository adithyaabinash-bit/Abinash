import React, { useState } from 'react';
import {
  AlignLeft,
  Copy,
  Check,
  Send,
  Sparkles,
  FileText,
  RotateCcw,
  ListOrdered,
  BookOpen,
} from 'lucide-react';
import { countWords } from '../../utils/textMetrics';

interface SummarizerWorkspaceProps {
  initialText?: string;
  onSendToEditor?: (text: string) => void;
}

export const SummarizerWorkspace: React.FC<SummarizerWorkspaceProps> = ({
  initialText = '',
  onSendToEditor,
}) => {
  const [inputText, setInputText] = useState<string>(
    initialText ||
      `Neural attention mechanisms have revolutionized natural language processing and computer vision applications. By selectively focusing on relevant subsets of input representations, models can capture long-range dependencies effectively. This paper reviews foundational architectures, comparing self-attention efficiency with state-space representations. In empirical evaluations, transformers consistently demonstrate superior scaling laws across diverse benchmark datasets, although computational quadratic complexity remains a known bottleneck during inference on sequence lengths exceeding thirty-two thousand tokens.`
  );
  const [summaryType, setSummaryType] = useState<string>('bullets');
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [compressionRatio, setCompressionRatio] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const summaryFormats = [
    { id: 'bullets', label: 'Key Bullets', icon: ListOrdered },
    { id: 'short', label: 'Short Synopsis (2-3 sentences)', icon: AlignLeft },
    { id: 'detailed', label: 'Comprehensive Summary', icon: FileText },
    { id: 'takeaways', label: 'Strategic Takeaways', icon: Sparkles },
    { id: 'notes', label: 'Study & Revision Notes', icon: BookOpen },
  ];

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          type: summaryType,
        }),
      });

      if (!res.ok) throw new Error('Summarization failed');
      const data = await res.json();
      setSummaryResult(data.summary);
      setCompressionRatio(data.compressionRatio);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputWords = countWords(inputText);
  const summaryWords = countWords(summaryResult);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
          <AlignLeft className="w-3.5 h-3.5" />
          Factual Condensation Engine
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Document &amp; Text Summarizer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Distill long research papers, executive memos, and articles into executive points or study notes while maintaining factual fidelity.
        </p>
      </div>

      {/* Summary Format Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-xs flex items-center gap-2 overflow-x-auto">
        {summaryFormats.map((f) => {
          const Icon = f.icon;
          const isSelected = summaryType === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSummaryType(f.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Box */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Source Document / Passage
              </span>
              <span className="text-slate-400">{inputWords} words</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste article, transcript, or document here..."
              rows={9}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm leading-relaxed outline-none focus:border-teal-500 resize-none"
              aria-label="Source document text for summarizer"
            />
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              onClick={handleSummarize}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Condensing...' : 'Generate Summary'}
            </button>
          </div>
        </div>

        {/* Output Summary Box */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Condensed Output
              </span>
              <div className="flex items-center gap-2">
                {compressionRatio && (
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                    {compressionRatio} of original size
                  </span>
                )}
                <span className="text-slate-400">
                  {summaryWords > 0 ? `${summaryWords} words` : 'Ready'}
                </span>
              </div>
            </div>

            <div className="w-full min-h-[220px] p-4 rounded-lg bg-teal-50/30 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60 text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
                  <AlignLeft className="w-6 h-6 animate-spin text-teal-500" />
                  <span className="text-xs">Extracting primary arguments and evidence...</span>
                </div>
              ) : summaryResult ? (
                summaryResult
              ) : (
                <p className="text-slate-400 italic text-xs">
                  Summary will display here after clicking "Generate Summary".
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleCopy}
              disabled={!summaryResult}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-40 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>

            {onSendToEditor && (
              <button
                onClick={() => onSendToEditor(summaryResult)}
                disabled={!summaryResult}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Insert in Editor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
