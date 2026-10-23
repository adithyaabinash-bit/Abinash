import React, { useState } from 'react';
import {
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Sliders,
  Send,
  HelpCircle,
} from 'lucide-react';
import { ParaphraseMode } from '../../types/writing';
import { countWords } from '../../utils/textMetrics';

interface ParaphraserWorkspaceProps {
  initialText?: string;
  onApplyToEditor?: (revised: string) => void;
}

export const ParaphraserWorkspace: React.FC<ParaphraserWorkspaceProps> = ({
  initialText = '',
  onApplyToEditor,
}) => {
  const [inputText, setInputText] = useState<string>(
    initialText ||
      'Their are several strategic advantages in order to adopt artificial intelligence in modern workflows. However, implementation should of been planned with strict data governance.'
  );
  const [revisedText, setRevisedText] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<ParaphraseMode>('professional');
  const [selectedTone, setSelectedTone] = useState<string>('confident');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const modes: { id: ParaphraseMode; name: string; desc: string }[] = [
    { id: 'standard', name: 'Standard', desc: 'Balanced rephrasing' },
    { id: 'professional', name: 'Professional', desc: 'Polished executive prose' },
    { id: 'academic', name: 'Academic', desc: 'Scholarly & rigorous vocabulary' },
    { id: 'simple', name: 'Simple', desc: 'Plain English (Grade 6 level)' },
    { id: 'fluent', name: 'Fluent', desc: 'Natural, smooth conversational flow' },
    { id: 'concise', name: 'Concise', desc: 'Eliminates filler and passive voice' },
    { id: 'creative', name: 'Creative', desc: 'Vibrant, expressive phrasing' },
  ];

  const tones = ['confident', 'formal', 'friendly', 'direct', 'persuasive'];

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode: selectedMode,
          tone: selectedTone,
        }),
      });

      if (!res.ok) throw new Error('Paraphrasing failed');
      const data = await res.json();
      setRevisedText(data.revised);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!revisedText) return;
    navigator.clipboard.writeText(revisedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputWords = countWords(inputText);
  const revisedWords = countWords(revisedText);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-xs font-semibold mb-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Multi-Mode AI Rewriter
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          AI Paraphraser &amp; Rephraser
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Rephrase complex sentences, eliminate passive clutter, and adapt prose for distinct reading audiences.
        </p>
      </div>

      {/* Mode Selector Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedMode === m.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Tone sub-selector */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Tone:</span>
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTone(t)}
              className={`px-2 py-0.5 rounded capitalize ${
                selectedTone === t
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Side by side comparison workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text Box */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Original Text
              </span>
              <span className="text-slate-400">{inputWords} words</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste sentence or paragraph to rephrase..."
              rows={8}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm leading-relaxed outline-none focus:border-indigo-500 resize-none"
              aria-label="Original text for paraphraser"
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
              onClick={handleParaphrase}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Rephrasing...' : 'Paraphrase Now'}
            </button>
          </div>
        </div>

        {/* Paraphrased Text Box */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Paraphrased Output ({selectedMode})
              </span>
              <span className="text-slate-400">
                {revisedWords > 0 ? `${revisedWords} words` : 'Awaiting input'}
              </span>
            </div>

            <div className="w-full min-h-[200px] p-4 rounded-lg bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs">Applying {selectedMode} syntactic restructuring...</span>
                </div>
              ) : revisedText ? (
                <p className="whitespace-pre-wrap">{revisedText}</p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic text-xs">
                  Click "Paraphrase Now" to generate an alternative phrasing that preserves meaning while improving clarity.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleCopy}
              disabled={!revisedText}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-40 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Result'}
            </button>

            {onApplyToEditor && (
              <button
                onClick={() => onApplyToEditor(revisedText)}
                disabled={!revisedText}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Apply to Editor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
