import React from 'react';
import {
  PenTool,
  ShieldAlert,
  Search,
  RefreshCw,
  Sparkles,
  Gauge,
  Plus,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { DocumentItem, UserUsage } from '../types/writing';
import { ActiveTab } from './Sidebar';

interface DashboardProps {
  documents: DocumentItem[];
  usage: UserUsage;
  onSelectDocument: (doc: DocumentItem) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  usage,
  onSelectDocument,
  onNewDocument,
  onDeleteDocument,
  onNavigate,
}) => {
  const toolCards = [
    {
      title: 'Grammar & Live Editor',
      desc: 'Grammarly-level real-time proofreading, tone metrics, and clarity enhancements.',
      icon: PenTool,
      tab: 'editor' as ActiveTab,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Core Tool',
    },
    {
      title: 'AI Content Detector',
      desc: 'Probabilistic AI authorship detection with sentence heatmaps and burstiness scores.',
      icon: ShieldAlert,
      tab: 'ai-detector' as ActiveTab,
      color: 'from-amber-500 to-orange-600',
      badge: 'Probabilistic',
    },
    {
      title: 'Plagiarism Checker',
      desc: 'Deep passage-level similarity verification, matched source excerpts, and citation alerts.',
      icon: Search,
      tab: 'plagiarism' as ActiveTab,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Similarity',
    },
    {
      title: 'AI Paraphraser',
      desc: 'Rewrite sentences across 7 distinct modes (Academic, Professional, Simple, Creative).',
      icon: RefreshCw,
      tab: 'paraphraser' as ActiveTab,
      color: 'from-purple-500 to-pink-600',
      badge: '7 Modes',
    },
    {
      title: 'AI Composition Engine',
      desc: 'Generate structured essay outlines, executive memos, cover letters, and research summaries.',
      icon: Sparkles,
      tab: 'ai-writer' as ActiveTab,
      color: 'from-violet-500 to-indigo-600',
      badge: 'Generator',
    },
    {
      title: 'Readability Studio',
      desc: 'Flesch-Kincaid, Gunning Fog, and passive voice breakdown for maximum clarity.',
      icon: Gauge,
      tab: 'readability' as ActiveTab,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Analytics',
    },
  ];

  const totalWords = documents.reduce((acc, d) => acc + (d.wordCount || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Intelligent Writing Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome to VeritasWrite AI
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Write, proofread, and analyze your prose with real-time grammar checking, AI content detection, plagiarism verification, and scholarly citation assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNewDocument}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold text-sm hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              New Document
            </button>
            <button
              onClick={() => onNavigate('editor')}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              Open Editor
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute left-1/2 -top-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      {/* Analytics & Quota Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Words Processed</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {usage.wordsProcessedMonth.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            of {usage.wordsLimitMonth.toLocaleString()} monthly limit
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Checks Performed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {usage.checksPerformed}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Grammar, AI & Plagiarism
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Saved Documents</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {documents.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalWords.toLocaleString()} total words stored
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Plan</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            {usage.tier}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Renews on {new Date(usage.planResetDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Quick Launch Writing Suite Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Specialized Writing Tools
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Select a tool to launch dedicated workspace
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={() => onNavigate(tool.tab)}
                className="group text-left p-5 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Launch Tool <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Documents Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Documents
            </h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {documents.length}
            </span>
          </div>
          <button
            onClick={() => onNavigate('documents')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All Documents <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {documents.length > 0 ? (
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/80">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/80 dark:hover:bg-slate-750 flex items-center justify-between gap-4 transition-colors"
                >
                  <div
                    onClick={() => {
                      onSelectDocument(doc);
                      onNavigate('editor');
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate">
                        {doc.title}
                      </h3>
                      {doc.overallScore && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          Score {doc.overallScore}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-xl">
                      {doc.content.slice(0, 100)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    <span className="hidden sm:inline">
                      {doc.wordCount.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => {
                        onSelectDocument(doc);
                        onNavigate('editor');
                      }}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-medium rounded-md transition-colors"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                      title="Delete document"
                      aria-label="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 p-8 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-900 dark:text-white">No documents yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create your first document to start writing, checking grammar, and generating citations.
            </p>
            <button
              onClick={onNewDocument}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm"
            >
              Create First Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
