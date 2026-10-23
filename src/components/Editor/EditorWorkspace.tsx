import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote as QuoteIcon,
  Code,
  Search,
  Check,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Wand2,
  AlertCircle,
  FileText,
  Volume2,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { WritingIssue, WritingScore, DocumentItem } from '../../types/writing';
import { applyReplacement, recalculateOffsets } from '../../utils/grammarRules';

interface EditorWorkspaceProps {
  document: DocumentItem | null;
  content: string;
  onChangeContent: (text: string) => void;
  issues: WritingIssue[];
  score: WritingScore | null;
  isChecking: boolean;
  onRunCheck: () => void;
  onAcceptIssue: (issue: WritingIssue) => void;
  onDismissIssue: (issueId: string) => void;
  onAcceptAllIssues: () => void;
  onOpenParaphraseWithText: (text: string) => void;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  document,
  content,
  onChangeContent,
  issues,
  score,
  isChecking,
  onRunCheck,
  onAcceptIssue,
  onDismissIssue,
  onAcceptAllIssues,
  onOpenParaphraseWithText,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [showTemplatesMenu, setShowTemplatesMenu] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Template sample documents
  const templates = [
    {
      name: 'Business Strategy Memo',
      content: `Their are several strategic advantages in order to adopt artificial intelligence in modern workflows.
However, implementation should of been planned with strict data governance. The company will definitely effect positive transformation if team leaders align on measurable goals.
At this point in time, machine learning algorithms are utilized by researchers to automate repetitive administrative tasks and improve accuracy across various organizational departments.`,
    },
    {
      name: 'Academic Paper Abstract',
      content: `Neural attention mechanisms have revolutionized natural language processing and computer vision applications.
By selectively focusing on relevant subsets of input representations, models can capture long-range dependencies effectively.
This paper reviews foundational architectures, comparing self-attention efficiency with state-space representations.`,
    },
    {
      name: 'Professional Cover Letter',
      content: `Dear Hiring Team,

I am writing to express my enthusiastic interest in the Senior Full-Stack Engineer position at your organization.
With over eight years of experience building performant web applications and machine learning integrations, I have consistently driven measurable product milestones.
Due to the fact that your platform prioritizes user experience and real-time reliability, my background in TypeScript and distributed systems makes me an ideal contributor.`,
    },
  ];

  // Formatting helpers for the textarea (wrapping selection)
  const applyTextWrap = (prefix: string, suffix: string = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChangeContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 10);
  };

  const applyHeading = (level: 1 | 2) => {
    const prefix = level === 1 ? '# ' : '## ';
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    onChangeContent(newContent);
  };

  const applyList = (ordered: boolean) => {
    const prefix = ordered ? '1. ' : '- ';
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    onChangeContent(newContent);
  };

  // Find and replace operations
  const handleReplace = () => {
    if (!findQuery) return;
    const idx = content.indexOf(findQuery);
    if (idx !== -1) {
      const newContent = content.substring(0, idx) + replaceQuery + content.substring(idx + findQuery.length);
      onChangeContent(newContent);
    }
  };

  const handleReplaceAll = () => {
    if (!findQuery) return;
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, replaceQuery);
    onChangeContent(newContent);
  };

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'correctness') {
      return ['grammar', 'spelling', 'punctuation'].includes(issue.category);
    }
    if (filterCategory === 'clarity') {
      return ['clarity', 'conciseness'].includes(issue.category);
    }
    if (filterCategory === 'style') {
      return ['tone', 'vocabulary'].includes(issue.category);
    }
    return issue.category === filterCategory;
  });

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500';
    if (val >= 70) return 'text-blue-600 dark:text-blue-400 border-blue-500';
    if (val >= 50) return 'text-amber-600 dark:text-amber-400 border-amber-500';
    return 'text-rose-600 dark:text-rose-400 border-rose-500';
  };

  const getScoreLabel = (val: number) => {
    if (val >= 90) return 'Exceptional';
    if (val >= 80) return 'Very Good';
    if (val >= 70) return 'Good';
    if (val >= 60) return 'Needs Polish';
    return 'Requires Attention';
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'grammar':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'spelling':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'punctuation':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'clarity':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'conciseness':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
      {/* Central Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
        {/* Editor Toolbar */}
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between gap-2 overflow-x-auto select-none shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => applyHeading(1)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Heading 1"
              aria-label="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyHeading(2)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Heading 2"
              aria-label="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => applyTextWrap('**')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Bold"
              aria-label="Bold text"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyTextWrap('*')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Italic"
              aria-label="Italic text"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyTextWrap('<u>', '</u>')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Underline"
              aria-label="Underline text"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyTextWrap('~~')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Strikethrough"
              aria-label="Strikethrough text"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => applyList(false)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Bullet List"
              aria-label="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyList(true)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Numbered List"
              aria-label="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyTextWrap('> ')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Quote"
              aria-label="Quote"
            >
              <QuoteIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyTextWrap('`')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Inline Code"
              aria-label="Inline code"
            >
              <Code className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => setShowFindReplace(!showFindReplace)}
              className={`p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                showFindReplace ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''
              }`}
              title="Find and Replace"
              aria-label="Find and replace"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Templates Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTemplatesMenu(!showTemplatesMenu)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                aria-label="Insert template"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Templates</span>
              </button>
              {showTemplatesMenu && (
                <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Insert Sample
                  </div>
                  {templates.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      onClick={() => {
                        onChangeContent(tmpl.content);
                        setShowTemplatesMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 truncate"
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRunCheck}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Check Document'}</span>
            </button>

            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={showRightPanel ? 'Collapse analysis panel' : 'Open analysis panel'}
              aria-label={showRightPanel ? 'Collapse analysis panel' : 'Open analysis panel'}
            >
              {showRightPanel ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Find and Replace Drawer */}
        {showFindReplace && (
          <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1">
              <span className="text-slate-400">Find:</span>
              <input
                type="text"
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                placeholder="Search phrase..."
                className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 w-32 sm:w-48"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1">
              <span className="text-slate-400">Replace:</span>
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replacement..."
                className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 w-32 sm:w-48"
              />
            </div>
            <button
              onClick={handleReplace}
              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-medium hover:bg-indigo-200"
            >
              Replace All
            </button>
            <button
              onClick={() => setShowFindReplace(false)}
              className="p-1 text-slate-400 hover:text-slate-600 ml-auto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Writing Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col min-h-[600px] overflow-hidden">
            {/* Visual issues quick banner */}
            {issues.length > 0 && (
              <div className="px-6 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <strong>{issues.length} writing suggestions</strong> identified in your document.
                </span>
                <button
                  onClick={onAcceptAllIssues}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Accept all safe fixes
                </button>
              </div>
            )}

            {/* Document Textarea */}
            <div className="flex-1 p-6 sm:p-10 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChangeContent(e.target.value)}
                placeholder="Start typing your essay, report, email, or manuscript here, or load a sample template from the toolbar..."
                className="w-full h-full min-h-[500px] resize-none border-none outline-none bg-transparent text-slate-800 dark:text-slate-100 text-base leading-relaxed tracking-normal font-sans placeholder:text-slate-400 dark:placeholder:text-slate-600 selection:bg-indigo-100 dark:selection:bg-indigo-900/60"
                aria-label="Main Document Content"
                spellCheck={false}
              />
            </div>

            {/* Quick detected words pill strip */}
            {issues.length > 0 && (
              <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                  Quick Flags:
                </span>
                {issues.slice(0, 5).map((iss) => (
                  <button
                    key={iss.id}
                    onClick={() => {
                      setSelectedIssueId(iss.id);
                      setShowRightPanel(true);
                    }}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${getCategoryBadgeClass(
                      iss.category
                    )}`}
                  >
                    <span className="line-through opacity-75">{iss.originalText}</span>
                    <span>→</span>
                    <span className="font-bold">{iss.replacement}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Analysis Panel */}
      {showRightPanel && (
        <aside className="w-80 lg:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden shadow-xs z-10">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Document Analysis
            </h2>
            <button
              onClick={() => setShowRightPanel(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="Close panel"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Overall Score Dial */}
            {score && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Writing Score
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {getScoreLabel(score.overall)}
                    </h3>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-lg ${getScoreColor(
                      score.overall
                    )}`}
                  >
                    {score.overall}
                  </div>
                </div>

                {/* Score Categories Bar */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-750 text-center">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {score.correctness}%
                    </div>
                    <div className="text-[10px] text-slate-500">Correctness</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {score.clarity}%
                    </div>
                    <div className="text-[10px] text-slate-500">Clarity</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {score.engagement}%
                    </div>
                    <div className="text-[10px] text-slate-500">Engagement</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {score.delivery}%
                    </div>
                    <div className="text-[10px] text-slate-500">Delivery</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({issues.length})
                </button>
                <button
                  onClick={() => setFilterCategory('correctness')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    filterCategory === 'correctness'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Correctness
                </button>
                <button
                  onClick={() => setFilterCategory('clarity')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    filterCategory === 'clarity'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Clarity
                </button>
                <button
                  onClick={() => setFilterCategory('style')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    filterCategory === 'style'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Style
                </button>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => {
                  const isSelected = selectedIssueId === issue.id;
                  return (
                    <div
                      key={issue.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300'
                      }`}
                    >
                      {/* Issue Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                            issue.category
                          )}`}
                        >
                          {issue.category}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDismissIssue(issue.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                            title="Dismiss suggestion"
                            aria-label="Dismiss suggestion"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Correction Replacement Preview */}
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="line-through text-rose-500 dark:text-rose-400 font-medium">
                          {issue.originalText}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {issue.replacement}
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        {issue.explanation}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          onClick={() => onOpenParaphraseWithText(issue.originalText)}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          Paraphrase
                        </button>

                        <button
                          onClick={() => onAcceptIssue(issue)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    No issues found
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your prose looks clean in this category!
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
