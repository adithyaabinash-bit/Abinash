import React, { useState } from 'react';
import {
  Quote,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { CitationData, CitationStyle } from '../../types/writing';
import { generateCitation } from '../../utils/citationFormatter';

export const CitationWorkspace: React.FC = () => {
  const [style, setStyle] = useState<CitationStyle>('apa');
  const [citationType, setCitationType] = useState<'journal' | 'book' | 'website'>('journal');
  const [title, setTitle] = useState<string>('Attention Is All You Need');
  const [authors, setAuthors] = useState<string[]>([
    'Ashish Vaswani',
    'Noam Shazeer',
    'Niki Parmar',
    'Jakob Uszkoreit',
  ]);
  const [authorInput, setAuthorInput] = useState<string>('');
  const [year, setYear] = useState<string>('2017');
  const [sourceOrJournal, setSourceOrJournal] = useState<string>(
    'Advances in Neural Information Processing Systems'
  );
  const [volume, setVolume] = useState<string>('30');
  const [issue, setIssue] = useState<string>('1');
  const [pages, setPages] = useState<string>('5998-6008');
  const [publisher, setPublisher] = useState<string>('Curran Associates, Inc.');
  const [doiOrUrl, setDoiOrUrl] = useState<string>('10.5555/3295222.3295349');

  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [copiedInText, setCopiedInText] = useState<boolean>(false);

  // Preset seminal citations
  const presets = [
    {
      label: 'Transformer Paper (Vaswani et al.)',
      data: {
        type: 'journal' as const,
        title: 'Attention Is All You Need',
        authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
        year: '2017',
        sourceOrJournal: 'Advances in Neural Information Processing Systems',
        volume: '30',
        issue: '1',
        pages: '5998-6008',
        doiOrUrl: '10.5555/3295222.3295349',
      },
    },
    {
      label: 'Shannon Information Theory (1948)',
      data: {
        type: 'journal' as const,
        title: 'A Mathematical Theory of Communication',
        authors: ['Claude E. Shannon'],
        year: '1948',
        sourceOrJournal: 'Bell System Technical Journal',
        volume: '27',
        issue: '3',
        pages: '379-423',
        doiOrUrl: '10.1002/j.1538-7305.1948.tb01338.x',
      },
    },
    {
      label: 'The Elements of Style (Strunk & White)',
      data: {
        type: 'book' as const,
        title: 'The Elements of Style',
        authors: ['William Strunk Jr.', 'E. B. White'],
        year: '1999',
        publisher: 'Allyn & Bacon',
        sourceOrJournal: '',
        volume: '',
        issue: '',
        pages: '105',
        doiOrUrl: '',
      },
    },
  ];

  const handleLoadPreset = (preset: (typeof presets)[0]) => {
    setCitationType(preset.data.type);
    setTitle(preset.data.title);
    setAuthors(preset.data.authors);
    setYear(preset.data.year);
    setSourceOrJournal(preset.data.sourceOrJournal);
    setVolume(preset.data.volume || '');
    setIssue(preset.data.issue || '');
    setPages(preset.data.pages || '');
    setPublisher(preset.data.publisher || '');
    setDoiOrUrl(preset.data.doiOrUrl || '');
  };

  const handleAddAuthor = () => {
    if (!authorInput.trim()) return;
    setAuthors([...authors, authorInput.trim()]);
    setAuthorInput('');
  };

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const citationData: CitationData = {
    title,
    authors,
    year,
    sourceOrJournal,
    volume,
    issue,
    pages,
    publisher,
    doiOrUrl,
    type: citationType,
  };

  const formatted = generateCitation(citationData, style);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(formatted.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyInText = () => {
    navigator.clipboard.writeText(formatted.inText);
    setCopiedInText(true);
    setTimeout(() => setCopiedInText(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2">
          <Quote className="w-3.5 h-3.5" />
          Academic Bibliographic Formatter
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Citation &amp; Reference Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Generate accurate bibliographic citations and in-text parentheticals across APA 7th, MLA 9th, Chicago 17th, and Harvard conventions.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0">Sample citations:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => handleLoadPreset(p)}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 font-medium shrink-0"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Source Classification
            </span>
            <div className="flex items-center gap-1">
              {(['journal', 'book', 'website'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCitationType(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium capitalize ${
                    citationType === t
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title of Paper, Book, or Page
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
              placeholder="e.g. Attention Is All You Need"
            />
          </div>

          {/* Authors List & Add */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Authors
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {authors.map((auth, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700"
                >
                  {auth}
                  <button
                    onClick={() => handleRemoveAuthor(idx)}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAuthor())}
                placeholder="Author name (e.g. Ada Lovelace)..."
                className="flex-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
              <button
                onClick={handleAddAuthor}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Year & Source */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {citationType === 'journal' ? 'Journal or Proceedings' : citationType === 'book' ? 'Publisher' : 'Website Name'}
              </label>
              <input
                type="text"
                value={citationType === 'book' ? publisher : sourceOrJournal}
                onChange={(e) =>
                  citationType === 'book' ? setPublisher(e.target.value) : setSourceOrJournal(e.target.value)
                }
                placeholder={citationType === 'book' ? 'Publisher name' : 'e.g. Nature Machine Intelligence'}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Volume, Issue, Pages, DOI */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Volume / Issue
              </label>
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Vol 12"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pages
              </label>
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="101-115"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                DOI / URL
              </label>
              <input
                type="text"
                value={doiOrUrl}
                onChange={(e) => setDoiOrUrl(e.target.value)}
                placeholder="10.1000/182"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Output & Style Selector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Style Selector Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs flex items-center justify-between text-xs font-semibold">
            {(['apa', 'mla', 'chicago', 'harvard'] as CitationStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`flex-1 py-2 rounded-lg text-center uppercase tracking-wider transition-all ${
                  style === s
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Full Reference Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Bibliographic Reference ({style.toUpperCase()})
              </span>
              <button
                onClick={handleCopyRef}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedRef ? 'Copied' : 'Copy Reference'}
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs leading-relaxed font-serif text-slate-900 dark:text-slate-100 selection:bg-indigo-100">
              {formatted.reference}
            </div>
          </div>

          {/* In-Text Citation Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                In-Text Parenthetical Citation
              </span>
              <button
                onClick={handleCopyInText}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copiedInText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedInText ? 'Copied' : 'Copy In-Text'}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs font-mono font-semibold text-indigo-900 dark:text-indigo-200">
              {formatted.inText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
