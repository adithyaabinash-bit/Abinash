import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  FileText,
  RotateCcw,
  BookOpen,
  Mail,
  FileSignature,
  Layers,
} from 'lucide-react';
import { countWords } from '../../utils/textMetrics';

interface AIWriterWorkspaceProps {
  onSendToEditor?: (text: string) => void;
}

export const AIWriterWorkspace: React.FC<AIWriterWorkspaceProps> = ({ onSendToEditor }) => {
  const [topic, setTopic] = useState<string>('The Role of Synthetic Data in Training Privacy-Preserving LLMs');
  const [format, setFormat] = useState<string>('Research Summary');
  const [audience, setAudience] = useState<string>('Technical & Research Specialists');
  const [tone, setTone] = useState<string>('Scholarly & Objective');
  const [length, setLength] = useState<string>('Comprehensive (approx. 400-600 words)');
  const [keyPoints, setKeyPoints] = useState<string>(
    'Differential privacy guarantees\nAddressing data scarcity in clinical and financial domains\nMitigating model collapse and evaluation benchmarks'
  );
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const formats = [
    { name: 'Research Summary', icon: BookOpen },
    { name: 'Essay Outline', icon: Layers },
    { name: 'Executive Memo', icon: FileText },
    { name: 'Professional Email', icon: Mail },
    { name: 'Cover Letter', icon: FileSignature },
    { name: 'Article Draft', icon: Sparkles },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai-writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          format,
          audience,
          tone,
          length,
          keyPoints,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setGeneratedDraft(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = countWords(generatedDraft);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-800 dark:text-violet-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          AI Composition &amp; Outlining Assistant
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          AI Writer &amp; Drafter
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Synthesize structured drafts, rigorous outlines, and targeted communications with tailored audience controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs & Configuration */}
        <div className="lg:col-span-5 space-y-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Writing Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.name;
                return (
                  <button
                    key={f.name}
                    onClick={() => setFormat(f.name)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic / Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Topic or Objective
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
              placeholder="e.g. Modern trends in quantum algorithm complexity..."
              aria-label="AI Writer topic or objective"
            />
          </div>

          {/* Key Points */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Key Arguments or Context (optional)
            </label>
            <textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
              placeholder="Enter bullet points (one per line)..."
              aria-label="AI Writer key points"
            />
          </div>

          {/* Audience & Tone */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
              >
                <option>General Audience</option>
                <option>Technical & Research Specialists</option>
                <option>Executive Leadership</option>
                <option>Academic Peers & Students</option>
                <option>Prospective Employers</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
              >
                <option>Scholarly & Objective</option>
                <option>Confident & Executive</option>
                <option>Engaging & Conversational</option>
                <option>Persuasive & Direct</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Synthesizing Draft...' : 'Generate First Draft'}
          </button>
        </div>

        {/* Right Output Draft Box */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                Generated Composition Draft
              </span>
              <span className="text-slate-400">
                {wordCount > 0 ? `${wordCount} words` : 'Ready to generate'}
              </span>
            </div>

            <div className="w-full min-h-[380px] p-5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-100 text-sm leading-relaxed overflow-y-auto max-h-[500px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
                  <Sparkles className="w-8 h-8 animate-spin text-violet-500" />
                  <span className="text-xs">Drafting structured content adhering to academic tone...</span>
                </div>
              ) : generatedDraft ? (
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {generatedDraft}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2 text-center p-6">
                  <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    No draft generated yet
                  </span>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Configure your desired topic, format, and audience on the left and click "Generate First Draft".
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleCopy}
              disabled={!generatedDraft}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Draft'}
            </button>

            {onSendToEditor && (
              <button
                onClick={() => onSendToEditor(generatedDraft)}
                disabled={!generatedDraft}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send to Live Editor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
