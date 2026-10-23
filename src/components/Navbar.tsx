import React from 'react';
import {
  Save,
  Undo2,
  Redo2,
  Download,
  Share2,
  Sun,
  Moon,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { DocumentItem } from '../types/writing';

interface NavbarProps {
  document: DocumentItem | null;
  onUpdateTitle: (title: string) => void;
  onManualSave: () => void;
  isSaving: boolean;
  lastSavedText: string;
  wordCount: number;
  readingTimeMinutes: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onExport: (format: 'txt' | 'md' | 'html') => void;
  onShare: () => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  document,
  onUpdateTitle,
  onManualSave,
  isSaving,
  lastSavedText,
  wordCount,
  readingTimeMinutes,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  darkMode,
  setDarkMode,
  onExport,
  onShare,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-CA', name: 'English (CA)' },
    { code: 'en-AU', name: 'English (AU)' },
  ];

  const handleShareClick = () => {
    onShare();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between z-20 transition-colors">
      {/* Left: Document Title & Save Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            type="text"
            value={document?.title || 'Untitled Document'}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded px-1.5 py-0.5 outline-none transition-all w-36 sm:w-56 truncate"
            title="Click to rename document"
            aria-label="Document Title"
          />
        </div>

        {/* Saved status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full">
          {isSaving ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {lastSavedText}
            </span>
          )}
        </div>
      </div>

      {/* Center: Controls (Undo, Redo, Word Count, Reading Time) */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
          <span className="flex items-center gap-1">
            <span className="font-bold text-slate-900 dark:text-white">{wordCount.toLocaleString()}</span> words
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-400" />
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            {readingTimeMinutes} min read
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
            aria-label="Language selector"
          >
            {languages.find((l) => l.code === selectedLanguage)?.name || 'English (US)'}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-30">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    selectedLanguage === lang.code
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lang.name}
                  {selectedLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Manual save button */}
        <button
          onClick={onManualSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md transition-colors"
          title="Manual Save snapshot"
          aria-label="Save document"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md transition-colors"
            aria-label="Export document options"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30">
              <button
                onClick={() => {
                  onExport('md');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
              >
                <span>Markdown (.md)</span>
                <span className="text-[10px] text-slate-400 font-mono">MD</span>
              </button>
              <button
                onClick={() => {
                  onExport('txt');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
              >
                <span>Plain Text (.txt)</span>
                <span className="text-[10px] text-slate-400 font-mono">TXT</span>
              </button>
              <button
                onClick={() => {
                  onExport('html');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
              >
                <span>Printable HTML / PDF</span>
                <span className="text-[10px] text-slate-400 font-mono">HTML</span>
              </button>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-md transition-colors"
          title="Share document link"
          aria-label="Share document"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
          <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Plan Pill */}
        <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
            <Sparkles className="w-3 h-3" />
            Pro Plan
          </span>
        </div>
      </div>
    </header>
  );
};
