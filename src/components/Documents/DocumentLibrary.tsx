import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Clock,
  History,
  Trash2,
  FileText,
  RotateCcw,
  Check,
  X,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { DocumentItem, DocumentVersion } from '../../types/writing';

interface DocumentLibraryProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onRestoreVersion: (docId: string, versionId: string) => Promise<void>;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  onSelectDocument,
  onNewDocument,
  onDeleteDocument,
  onRestoreVersion,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [inspectingVersionsDoc, setInspectingVersionsDoc] = useState<DocumentItem | null>(null);
  const [docVersions, setDocVersions] = useState<DocumentVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(documents.flatMap((d) => d.tags || [])));

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || (doc.tags && doc.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const handleOpenVersions = async (doc: DocumentItem) => {
    setInspectingVersionsDoc(doc);
    setIsLoadingVersions(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/versions`);
      if (res.ok) {
        const data = await res.json();
        setDocVersions(data.versions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!inspectingVersionsDoc) return;
    setRestoringVersionId(versionId);
    try {
      await onRestoreVersion(inspectingVersionsDoc.id, versionId);
      setInspectingVersionsDoc(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRestoringVersionId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 text-xs font-semibold mb-2">
            <FolderOpen className="w-3.5 h-3.5" />
            Document Cloud &amp; Version History
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Access your saved drafts, restore previous revision snapshots, and organize projects by category.
          </p>
        </div>

        <button
          onClick={onNewDocument}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title or text..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tags Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors ${
              selectedTag === 'all'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All ({documents.length})
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors ${
                selectedTag === t
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    onClick={() => onSelectDocument(doc)}
                    className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer truncate"
                  >
                    {doc.title}
                  </h3>
                  {doc.overallScore && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded shrink-0">
                      Score {doc.overallScore}
                    </span>
                  )}
                </div>

                <p
                  onClick={() => onSelectDocument(doc)}
                  className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed cursor-pointer mb-4"
                >
                  {doc.content || 'Empty document...'}
                </p>

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mb-4">
                    {doc.tags.map((tg) => (
                      <span
                        key={tg}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenVersions(doc)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Version history"
                    aria-label="Version history"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete document"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold rounded text-xs transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            No matching documents found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new document.
          </p>
        </div>
      )}

      {/* Version History Modal */}
      {inspectingVersionsDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Version History
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">
                  {inspectingVersionsDoc.title}
                </p>
              </div>
              <button
                onClick={() => setInspectingVersionsDoc(null)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingVersions ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading saved snapshots...
              </div>
            ) : docVersions.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {docVersions.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {ver.label || `Snapshot ${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ver.wordCount} words
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(ver.savedAt).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestore(ver.id)}
                      disabled={restoringVersionId === ver.id}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No past snapshots recorded yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
