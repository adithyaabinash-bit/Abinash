import React from 'react';
import {
  LayoutDashboard,
  PenTool,
  ShieldAlert,
  Search,
  RefreshCw,
  Sparkles,
  AlignLeft,
  Gauge,
  Quote,
  FolderOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { UserUsage } from '../types/writing';

export type ActiveTab =
  | 'dashboard'
  | 'editor'
  | 'ai-detector'
  | 'plagiarism'
  | 'paraphraser'
  | 'ai-writer'
  | 'summarizer'
  | 'readability'
  | 'citations'
  | 'documents';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewDocument: () => void;
  usage: UserUsage;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  onOpenShortcuts: () => void;
  onOpenUpgrade: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewDocument,
  usage,
  collapsed,
  setCollapsed,
  onOpenShortcuts,
  onOpenUpgrade,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor' as ActiveTab, label: 'Live Editor', icon: PenTool, badge: 'Core' },
    { id: 'ai-detector' as ActiveTab, label: 'AI Detector', icon: ShieldAlert },
    { id: 'plagiarism' as ActiveTab, label: 'Plagiarism Checker', icon: Search },
    { id: 'paraphraser' as ActiveTab, label: 'Paraphraser', icon: RefreshCw },
    { id: 'ai-writer' as ActiveTab, label: 'AI Writer', icon: Sparkles },
    { id: 'summarizer' as ActiveTab, label: 'Summarizer', icon: AlignLeft },
    { id: 'readability' as ActiveTab, label: 'Readability Studio', icon: Gauge },
    { id: 'citations' as ActiveTab, label: 'Citation Generator', icon: Quote },
    { id: 'documents' as ActiveTab, label: 'My Documents', icon: FolderOpen },
  ];

  const usagePercent = Math.min(
    100,
    Math.round((usage.wordsProcessedMonth / usage.wordsLimitMonth) * 100)
  );

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base block leading-none">
                Veritas<span className="text-indigo-600 dark:text-indigo-400">Write</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                AI Intelligence
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Document Button */}
      <div className="p-3">
        <button
          onClick={onNewDocument}
          className={`w-full flex items-center justify-center gap-2 font-semibold text-sm rounded-xl transition-all shadow-sm ${
            collapsed
              ? 'p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
          }`}
          title="Create New Document"
          aria-label="New Document"
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Document</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Usage & Shortcuts */}
      {!collapsed ? (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Usage Box */}
          <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-750 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Monthly Usage
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{usagePercent}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{usage.wordsProcessedMonth.toLocaleString()} words</span>
              <button
                onClick={onOpenUpgrade}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center font-medium"
              >
                Upgrade <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Shortcuts button */}
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5" />
              Shortcuts
            </span>
            <kbd className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2">
          <button
            onClick={onOpenUpgrade}
            className="p-2 text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
            title="Usage & Upgrades"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenShortcuts}
            className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
