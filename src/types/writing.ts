export type IssueCategory =
  | 'grammar'
  | 'spelling'
  | 'punctuation'
  | 'clarity'
  | 'conciseness'
  | 'tone'
  | 'vocabulary';

export type IssueSeverity = 'error' | 'warning' | 'suggestion';

export interface WritingIssue {
  id: string;
  originalText: string;
  replacement: string;
  explanation: string;
  category: IssueCategory;
  severity: IssueSeverity;
  startIndex: number;
  endIndex: number;
  ruleName?: string;
}

export interface WritingScore {
  overall: number;
  correctness: number;
  clarity: number;
  engagement: number;
  delivery: number;
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  readingTimeMinutes: number;
  readabilityGrade: string;
  fleschReadingEase: number;
}

export interface SentenceAIScore {
  sentence: string;
  aiProbability: number; // 0 to 100
  classification: 'human' | 'mixed' | 'ai';
  reasoning: string;
  startIndex?: number;
  endIndex?: number;
}

export interface AIDetectionResult {
  overallProbability: number;
  classification: 'human' | 'mixed' | 'ai';
  sentenceScores: SentenceAIScore[];
  burstinessScore: number; // 0 to 100
  perplexityScore: number; // 0 to 100
  explanation: string;
  limitationsNotice: string;
  providerName: string;
  analyzedAt: string;
  wordCount: number;
}

export interface MatchedPassage {
  id: string;
  passage: string;
  sourceTitle: string;
  sourceUrl: string;
  similarityPct: number;
  startIndex: number;
  endIndex: number;
  matchType: 'identical' | 'paraphrased' | 'citation_missing';
  context?: string;
}

export interface PlagiarismSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  matchPct: number;
  matchedWords: number;
}

export interface PlagiarismResult {
  overallSimilarity: number;
  totalPassagesChecked: number;
  matchedPassages: MatchedPassage[];
  sources: PlagiarismSource[];
  coverageDisclaimer: string;
  providerName: string;
  checkedAt: string;
  wordCount: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  wordCount: number;
  overallScore?: number;
  versionCount: number;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  title: string;
  content: string;
  savedAt: string;
  wordCount: number;
  label: string;
}

export interface UserUsage {
  tier: 'free' | 'student' | 'pro';
  wordsProcessedMonth: number;
  wordsLimitMonth: number;
  checksPerformed: number;
  documentsSaved: number;
  planResetDate: string;
}

export type ParaphraseMode =
  | 'standard'
  | 'professional'
  | 'academic'
  | 'simple'
  | 'fluent'
  | 'concise'
  | 'creative';

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard';

export interface CitationData {
  title: string;
  authors: string[];
  year: string;
  sourceOrJournal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doiOrUrl?: string;
  type: 'journal' | 'book' | 'website';
}

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFogIndex: number;
  readingEaseLabel: string;
  gradeLevelLabel: string;
  averageSentenceLength: number;
  averageWordLength: number;
  complexWordsPercentage: number;
  passiveVoiceCount: number;
  passiveVoicePercentage: number;
  hardSentencesCount: number;
  veryHardSentencesCount: number;
  suggestions: string[];
}
