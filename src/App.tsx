/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EditorWorkspace } from './components/Editor/EditorWorkspace';
import { AIDetectorWorkspace } from './components/AIDetector/AIDetectorWorkspace';
import { PlagiarismWorkspace } from './components/Plagiarism/PlagiarismWorkspace';
import { ParaphraserWorkspace } from './components/Paraphraser/ParaphraserWorkspace';
import { AIWriterWorkspace } from './components/AIWriter/AIWriterWorkspace';
import { SummarizerWorkspace } from './components/Summarizer/SummarizerWorkspace';
import { ReadabilityWorkspace } from './components/Readability/ReadabilityWorkspace';
import { CitationWorkspace } from './components/Citations/CitationWorkspace';
import { DocumentLibrary } from './components/Documents/DocumentLibrary';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { UpgradeModal } from './components/Modals/UpgradeModal';
import { DocumentItem, WritingIssue, WritingScore, UserUsage } from './types/writing';
import { countWords, calculateReadingTime } from './utils/textMetrics';
import { applyReplacement, recalculateOffsets } from './utils/grammarRules';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Document management state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');

  // Undo / Redo history stack
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Grammar & Analysis state
  const [issues, setIssues] = useState<WritingIssue[]>([]);
  const [writingScore, setWritingScore] = useState<WritingScore | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedText, setLastSavedText] = useState<string>('Saved to Cloud');

  // User Usage State
  const [usage, setUsage] = useState<UserUsage>({
    tier: 'pro',
    wordsProcessedMonth: 12450,
    wordsLimitMonth: 150000,
    checksPerformed: 68,
    documentsSaved: 2,
    planResetDate: new Date(Date.now() + 3600000 * 24 * 18).toISOString(),
  });

  // Language & Modals
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Fetch initial documents & usage on mount
  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
          setActiveDocument(data.documents[0]);
          setEditorContent(data.documents[0].content);
        }
      })
      .catch((err) => console.error('Error fetching documents:', err));

    fetch('/api/user/usage')
      .then((res) => res.json())
      .then((data) => setUsage(data))
      .catch((err) => console.error('Error fetching usage:', err));
  }, []);

  // Auto collapse sidebar on mobile viewports
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme Sync with HTML Document Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Run Grammar check whenever activeDocument or check is requested
  const runGrammarCheck = useCallback(async (textToCheck: string) => {
    if (!textToCheck.trim()) {
      setIssues([]);
      setWritingScore(null);
      return;
    }

    setIsChecking(true);
    try {
      const res = await fetch('/api/grammar/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToCheck }),
      });

      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
        setWritingScore(data.score || null);
      }
    } catch (err) {
      console.error('Error checking grammar:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Initial check when activeDocument loaded
  useEffect(() => {
    if (activeDocument && editorContent) {
      runGrammarCheck(editorContent);
    }
  }, [activeDocument?.id]);

  // Handle content updates in editor with undo-tracking
  const handleContentChange = (newText: string) => {
    setHistoryStack((prev) => [...prev.slice(-30), editorContent]);
    setRedoStack([]);
    setEditorContent(newText);
  };

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, editorContent]);
    setEditorContent(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistoryStack((prev) => [...prev, editorContent]);
    setEditorContent(next);
  };

  // Debounced Autosave
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!activeDocument) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/documents/${activeDocument.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: editorContent,
            title: activeDocument.title,
          }),
        });

        if (res.ok) {
          const updatedDoc = await res.json();
          setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
          setLastSavedText('Saved just now');
        }
      } catch (err) {
        console.error('Autosave error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [editorContent, activeDocument?.id, activeDocument?.title]);

  // Manual Save with explicit snapshot creation
  const handleManualSave = async () => {
    if (!activeDocument) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/documents/${activeDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editorContent,
          title: activeDocument.title,
          createSnapshot: true,
          snapshotLabel: `Manual Snapshot (${new Date().toLocaleTimeString()})`,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setActiveDocument(updated);
        setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        setLastSavedText('Snapshot saved');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Title Update
  const handleUpdateTitle = async (newTitle: string) => {
    if (!activeDocument) return;
    const updated = { ...activeDocument, title: newTitle };
    setActiveDocument(updated);
    setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

    try {
      await fetch(`/api/documents/${activeDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Document
  const handleNewDocument = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Document ${documents.length + 1}`,
          content: '',
          tags: ['Draft'],
        }),
      });

      if (res.ok) {
        const newDoc: DocumentItem = await res.json();
        setDocuments((prev) => [newDoc, ...prev]);
        setActiveDocument(newDoc);
        setEditorContent('');
        setIssues([]);
        setWritingScore(null);
        setActiveTab('editor');
      }
    } catch (err) {
      console.error('Error creating document:', err);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = documents.filter((d) => d.id !== id);
        setDocuments(remaining);
        if (activeDocument?.id === id) {
          if (remaining.length > 0) {
            setActiveDocument(remaining[0]);
            setEditorContent(remaining[0].content);
          } else {
            setActiveDocument(null);
            setEditorContent('');
          }
        }
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // Restore Document Version
  const handleRestoreVersion = async (docId: string, versionId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      if (res.ok) {
        const restored: DocumentItem = await res.json();
        setDocuments((prev) => prev.map((d) => (d.id === restored.id ? restored : d)));
        if (activeDocument?.id === docId) {
          setActiveDocument(restored);
          setEditorContent(restored.content);
          runGrammarCheck(restored.content);
        }
      }
    } catch (err) {
      console.error('Error restoring version:', err);
    }
  };

  // Accept Single Issue
  const handleAcceptIssue = (issue: WritingIssue) => {
    const updated = applyReplacement(
      editorContent,
      issue.startIndex,
      issue.endIndex,
      issue.replacement
    );
    const delta = issue.replacement.length - (issue.endIndex - issue.startIndex);

    setHistoryStack((prev) => [...prev, editorContent]);
    setRedoStack([]);
    setEditorContent(updated);

    // Filter out accepted issue and recalculate downstream offsets
    const remaining = issues.filter((i) => i.id !== issue.id);
    const shifted = recalculateOffsets(remaining, issue.startIndex, delta);
    setIssues(shifted);
  };

  // Dismiss Single Issue
  const handleDismissIssue = (issueId: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
  };

  // Accept All Safe Issues
  const handleAcceptAllIssues = () => {
    if (issues.length === 0) return;
    let newContent = editorContent;

    // Apply from end to start so indices remain valid
    const sorted = [...issues].sort((a, b) => b.startIndex - a.startIndex);
    for (const iss of sorted) {
      newContent = applyReplacement(newContent, iss.startIndex, iss.endIndex, iss.replacement);
    }

    setHistoryStack((prev) => [...prev, editorContent]);
    setRedoStack([]);
    setEditorContent(newContent);
    setIssues([]);
    runGrammarCheck(newContent);
  };

  // Export Document in Chosen Format
  const handleExport = (format: 'txt' | 'md' | 'html') => {
    const filename = `${activeDocument?.title || 'document'}.${format}`;
    let data = editorContent;
    let mime = 'text/plain;charset=utf-8';

    if (format === 'html') {
      mime = 'text/html;charset=utf-8';
      data = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${activeDocument?.title || 'VeritasWrite Document'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${activeDocument?.title || 'Document'}</h1>
  <p>${editorContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>
</body>
</html>`;
    }

    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorContent, activeDocument]);

  const wordCount = countWords(editorContent);
  const readingTime = calculateReadingTime(wordCount);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewDocument={handleNewDocument}
        usage={usage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          document={activeDocument}
          onUpdateTitle={handleUpdateTitle}
          onManualSave={handleManualSave}
          isSaving={isSaving}
          lastSavedText={lastSavedText}
          wordCount={wordCount}
          readingTimeMinutes={readingTime}
          canUndo={historyStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onExport={handleExport}
          onShare={() => navigator.clipboard.writeText(window.location.href)}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />

        {/* Dynamic Workspace Content */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              documents={documents}
              usage={usage}
              onSelectDocument={(doc) => {
                setActiveDocument(doc);
                setEditorContent(doc.content);
              }}
              onNewDocument={handleNewDocument}
              onDeleteDocument={handleDeleteDocument}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'editor' && (
            <EditorWorkspace
              document={activeDocument}
              content={editorContent}
              onChangeContent={handleContentChange}
              issues={issues}
              score={writingScore}
              isChecking={isChecking}
              onRunCheck={() => runGrammarCheck(editorContent)}
              onAcceptIssue={handleAcceptIssue}
              onDismissIssue={handleDismissIssue}
              onAcceptAllIssues={handleAcceptAllIssues}
              onOpenParaphraseWithText={(txt) => {
                setActiveTab('paraphraser');
              }}
            />
          )}

          {activeTab === 'ai-detector' && (
            <AIDetectorWorkspace
              initialText={editorContent}
              onSendToEditor={(txt) => {
                setEditorContent(txt);
                setActiveTab('editor');
              }}
            />
          )}

          {activeTab === 'plagiarism' && (
            <PlagiarismWorkspace initialText={editorContent} />
          )}

          {activeTab === 'paraphraser' && (
            <ParaphraserWorkspace
              initialText={editorContent}
              onApplyToEditor={(revised) => {
                setEditorContent(revised);
                setActiveTab('editor');
              }}
            />
          )}

          {activeTab === 'ai-writer' && (
            <AIWriterWorkspace
              onSendToEditor={(txt) => {
                setEditorContent(txt);
                setActiveTab('editor');
              }}
            />
          )}

          {activeTab === 'summarizer' && (
            <SummarizerWorkspace
              initialText={editorContent}
              onSendToEditor={(txt) => {
                setEditorContent(txt);
                setActiveTab('editor');
              }}
            />
          )}

          {activeTab === 'readability' && (
            <ReadabilityWorkspace
              initialText={editorContent}
              onSendToEditor={(txt) => {
                setEditorContent(txt);
                setActiveTab('editor');
              }}
            />
          )}

          {activeTab === 'citations' && <CitationWorkspace />}

          {activeTab === 'documents' && (
            <DocumentLibrary
              documents={documents}
              onSelectDocument={(doc) => {
                setActiveDocument(doc);
                setEditorContent(doc.content);
                setActiveTab('editor');
              }}
              onNewDocument={handleNewDocument}
              onDeleteDocument={handleDeleteDocument}
              onRestoreVersion={handleRestoreVersion}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        usage={usage}
      />
    </div>
  );
}
