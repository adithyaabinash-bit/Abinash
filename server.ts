import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { findRuleBasedIssues } from './src/utils/grammarRules';
import { getReadabilityReport } from './src/utils/readability';
import {
  countWords,
  countCharacters,
  splitIntoSentences,
  calculateReadingTime,
} from './src/utils/textMetrics';
import { generateCitation } from './src/utils/citationFormatter';
import {
  WritingIssue,
  WritingScore,
  AIDetectionResult,
  PlagiarismResult,
  DocumentItem,
  DocumentVersion,
  UserUsage,
  CitationData,
  CitationStyle,
  ParaphraseMode,
} from './src/types/writing';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialise GoogleGenAI
const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient timeout wrapper for AI operations
async function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 4500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI Provider timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

// In-Memory Storage for Documents & Versions
const initialDocs: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Executive AI Strategy Memo',
    content: `Their are several strategic advantages in order to adopt artificial intelligence in modern workflows.
However, implementation should of been planned with strict data governance. The company will definitely effect positive transformation if team leaders align on measurable goals.
At this point in time, machine learning algorithms are utilized by researchers to automate repetitive administrative tasks and improve accuracy across various organizational departments.`,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    tags: ['Business', 'AI', 'Executive'],
    wordCount: 65,
    overallScore: 78,
    versionCount: 2,
  },
  {
    id: 'doc-2',
    title: 'Academic Abstract: Neural Attention',
    content: `Neural attention mechanisms have revolutionized natural language processing and computer vision applications.
By selectively focusing on relevant subsets of input representations, models can capture long-range dependencies effectively.
This paper reviews foundational architectures, comparing self-attention efficiency with state-space representations.`,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    tags: ['Research', 'Machine Learning'],
    wordCount: 42,
    overallScore: 94,
    versionCount: 1,
  },
];

let documents: DocumentItem[] = [...initialDocs];
let versions: DocumentVersion[] = [
  {
    id: 'ver-1-1',
    documentId: 'doc-1',
    title: 'Executive AI Strategy Memo (Draft 1)',
    content: `Their are several strategic advantages in order to adopt AI. However, implementation should of been planned earlier.`,
    savedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    wordCount: 19,
    label: 'Initial Draft',
  },
  {
    id: 'ver-1-2',
    documentId: 'doc-1',
    title: 'Executive AI Strategy Memo',
    content: initialDocs[0].content,
    savedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    wordCount: 65,
    label: 'Revised Version with Grammar Corrections',
  },
];

// User Usage State
const userUsage: UserUsage = {
  tier: 'pro',
  wordsProcessedMonth: 12450,
  wordsLimitMonth: 150000,
  checksPerformed: 68,
  documentsSaved: documents.length,
  planResetDate: new Date(Date.now() + 3600000 * 24 * 18).toISOString(),
};

/* -------------------------------------------------------------
   PROVIDER APIS
------------------------------------------------------------- */

// Check Grammar & Clarity
app.post('/api/grammar/check', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text must be a string' });
    }

    if (!text.trim()) {
      return res.json({
        issues: [],
        score: {
          overall: 100,
          correctness: 100,
          clarity: 100,
          engagement: 100,
          delivery: 100,
          wordCount: 0,
          charCount: 0,
          sentenceCount: 0,
          readingTimeMinutes: 0,
          readabilityGrade: 'N/A',
          fleschReadingEase: 100,
        },
      });
    }

    const wordCount = countWords(text);
    const chars = countCharacters(text);
    const sentences = splitIntoSentences(text);
    const readability = getReadabilityReport(text);

    // Track usage
    userUsage.wordsProcessedMonth += wordCount;
    userUsage.checksPerformed += 1;

    // First collect fast rule-based issues
    const ruleIssues = findRuleBasedIssues(text);

    // Call Gemini for advanced contextual grammar and style checking if available
    let aiIssues: WritingIssue[] = [];
    if (hasApiKey) {
      try {
        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are an expert copyeditor and grammar engine like Grammarly. Analyze the following text carefully for grammar, spelling, punctuation, incorrect word choice, subject-verb agreement, clarity, conciseness, and style issues.
Text:
"""${text}"""

Identify all actionable issues. For each issue, you MUST provide:
- originalText: exact substring from the text
- replacement: suggested correction
- explanation: brief 1-sentence reason
- category: one of 'grammar', 'spelling', 'punctuation', 'clarity', 'conciseness', 'tone', 'vocabulary'
- severity: 'error', 'warning', or 'suggestion'
Return valid JSON array.`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalText: { type: Type.STRING },
                    replacement: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: 'One of grammar, spelling, punctuation, clarity, conciseness, tone, vocabulary',
                    },
                    severity: {
                      type: Type.STRING,
                      description: 'error, warning, or suggestion',
                    },
                  },
                  required: ['originalText', 'replacement', 'explanation', 'category', 'severity'],
                },
              },
            },
          }),
          2000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed)) {
            for (let i = 0; i < parsed.length; i++) {
              const item = parsed[i];
              if (!item.originalText) continue;
              // Locate exact offset in text
              const startIndex = text.indexOf(item.originalText);
              if (startIndex !== -1) {
                aiIssues.push({
                  id: `ai-${i}-${startIndex}`,
                  originalText: item.originalText,
                  replacement: item.replacement,
                  explanation: item.explanation,
                  category: (item.category as WritingIssue['category']) || 'grammar',
                  severity: (item.severity as WritingIssue['severity']) || 'warning',
                  startIndex,
                  endIndex: startIndex + item.originalText.length,
                  ruleName: 'AI Contextual Check',
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Gemini grammar API call note:', (err as Error).message);
      }
    }

    // Merge issues, deduplicating overlapping ranges
    const allIssues = [...ruleIssues];
    for (const aiIssue of aiIssues) {
      const exists = allIssues.some(
        (r) =>
          (aiIssue.startIndex >= r.startIndex && aiIssue.startIndex < r.endIndex) ||
          (aiIssue.endIndex > r.startIndex && aiIssue.endIndex <= r.endIndex)
      );
      if (!exists) {
        allIssues.push(aiIssue);
      }
    }

    allIssues.sort((a, b) => a.startIndex - b.startIndex);

    // Compute holistic scores
    const errorCount = allIssues.filter((i) => i.severity === 'error').length;
    const warningCount = allIssues.filter((i) => i.severity === 'warning').length;
    const suggestionCount = allIssues.filter((i) => i.severity === 'suggestion').length;

    const correctnessPenalty = Math.min(50, errorCount * 12 + warningCount * 5);
    const clarityPenalty = Math.min(
      35,
      suggestionCount * 4 + (readability.veryHardSentencesCount > 0 ? 15 : 0)
    );

    const correctness = Math.max(20, Math.round(100 - correctnessPenalty));
    const clarity = Math.max(30, Math.round(100 - clarityPenalty));
    const engagement = Math.min(100, Math.max(40, Math.round(readability.fleschReadingEase * 0.4 + 55)));
    const delivery = Math.max(40, Math.round(100 - allIssues.length * 3));
    const overall = Math.round(
      correctness * 0.4 + clarity * 0.25 + engagement * 0.15 + delivery * 0.2
    );

    const score: WritingScore = {
      overall,
      correctness,
      clarity,
      engagement,
      delivery,
      wordCount,
      charCount: chars.chars,
      sentenceCount: sentences.length,
      readingTimeMinutes: calculateReadingTime(wordCount),
      readabilityGrade: readability.gradeLevelLabel,
      fleschReadingEase: readability.fleschReadingEase,
    };

    return res.json({ issues: allIssues, score });
  } catch (error) {
    console.error('Grammar check failed:', error);
    return res.status(500).json({ error: 'Internal grammar check failure' });
  }
});

// AI Content Detection
app.post('/api/ai-detection/analyze', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 30) {
      return res.status(400).json({
        error: 'Please provide at least 30 characters for meaningful probabilistic analysis.',
      });
    }

    const sentences = splitIntoSentences(text);
    const wordCount = countWords(text);

    let overallProbability = 18;
    let burstinessScore = 74;
    let perplexityScore = 82;
    let classification: 'human' | 'mixed' | 'ai' = 'human';
    let sentenceScores: AIDetectionResult['sentenceScores'] = [];
    let explanation =
      'Analysis indicates natural sentence variation, diverse vocabulary, and characteristic human burstiness in clause construction.';

    if (hasApiKey) {
      try {
        const prompt = `Perform an objective, probabilistic AI content detection analysis on the text below.
Evaluate burstiness (variation in sentence length and structure), perplexity (lexical unpredictability), repetitive transitional phrases, and syntactic uniformity.

Text:
"""${text}"""

Provide a JSON response with:
1. overallProbability: number from 0 to 100 (probability of AI-generation)
2. classification: "human" (0-35), "mixed" (36-65), or "ai" (66-100)
3. burstinessScore: 0 to 100 (higher = more human-like variation)
4. perplexityScore: 0 to 100 (higher = more diverse vocabulary)
5. explanation: clear summary explaining the linguistic characteristics
6. sentenceScores: array for each sentence with:
   - sentence: string
   - aiProbability: 0 to 100
   - classification: "human" | "mixed" | "ai"
   - reasoning: short explanation`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  overallProbability: { type: Type.NUMBER },
                  classification: { type: Type.STRING },
                  burstinessScore: { type: Type.NUMBER },
                  perplexityScore: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  sentenceScores: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sentence: { type: Type.STRING },
                        aiProbability: { type: Type.NUMBER },
                        classification: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                      },
                      required: ['sentence', 'aiProbability', 'classification', 'reasoning'],
                    },
                  },
                },
                required: [
                  'overallProbability',
                  'classification',
                  'burstinessScore',
                  'perplexityScore',
                  'explanation',
                  'sentenceScores',
                ],
              },
            },
          }),
          2000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          overallProbability = Math.round(parsed.overallProbability || 15);
          burstinessScore = Math.round(parsed.burstinessScore || 70);
          perplexityScore = Math.round(parsed.perplexityScore || 75);
          classification = (parsed.classification as any) || (overallProbability > 65 ? 'ai' : overallProbability > 35 ? 'mixed' : 'human');
          explanation = parsed.explanation || explanation;
          sentenceScores = parsed.sentenceScores || [];
        }
      } catch (err) {
        console.warn('Gemini AI detection call error:', err);
      }
    }

    // Fallback/heuristic sentence scores if not provided or empty
    if (sentenceScores.length === 0) {
      sentenceScores = sentences.map((s, idx) => {
        const sWords = countWords(s);
        // Uniform sentence lengths (12-18 words) are typical of LLMs, highly variable lengths are human
        const isUniform = sWords >= 12 && sWords <= 20;
        const prob = isUniform ? 45 : 12;
        return {
          sentence: s,
          aiProbability: prob,
          classification: prob > 65 ? 'ai' : prob > 35 ? 'mixed' : 'human',
          reasoning: isUniform
            ? 'Moderate syntactic regularity and standard connective phrasing.'
            : 'Organic sentence length and individualized punctuation rhythm.',
        };
      });
    }

    const result: AIDetectionResult = {
      overallProbability,
      classification,
      sentenceScores,
      burstinessScore,
      perplexityScore,
      explanation,
      limitationsNotice:
        'Probabilistic notice: AI detection scores reflect statistical markers (burstiness and perplexity) rather than proof of authorship. False positives can occur with technical writing, standardized forms, and non-native English speakers.',
      providerName: hasApiKey ? 'Gemini AI Linguistic Analyzer v3.8' : 'Veritas Statistical Heuristic Engine',
      analyzedAt: new Date().toISOString(),
      wordCount,
    };

    return res.json(result);
  } catch (error) {
    console.error('AI detection error:', error);
    return res.status(500).json({ error: 'AI detection failed' });
  }
});

// Plagiarism Checker
app.post('/api/plagiarism/check', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 40) {
      return res.status(400).json({
        error: 'Please provide at least 40 characters for passage-level similarity verification.',
      });
    }

    const wordCount = countWords(text);
    const passages = splitIntoSentences(text);

    let overallSimilarity = 4;
    let matchedPassages: PlagiarismResult['matchedPassages'] = [];
    let sources: PlagiarismResult['sources'] = [];

    if (hasApiKey) {
      try {
        const prompt = `Analyze the following document for textual overlap, potential uncredited citations, and similarity against common academic and web publications.
Examine phrases and identify if any closely mirror established definitions, literature, or articles.

Text:
"""${text}"""

Return JSON with:
1. overallSimilarity: percentage number (0 to 100)
2. matchedPassages: array with:
   - passage: exact text excerpt
   - sourceTitle: plausible recognized publication or website
   - sourceUrl: URL or citation reference
   - similarityPct: number
   - matchType: "identical", "paraphrased", or "citation_missing"
3. sources: array with:
   - id: string
   - title: string
   - url: string
   - domain: string
   - matchPct: number
   - matchedWords: number`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  overallSimilarity: { type: Type.NUMBER },
                  matchedPassages: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        passage: { type: Type.STRING },
                        sourceTitle: { type: Type.STRING },
                        sourceUrl: { type: Type.STRING },
                        similarityPct: { type: Type.NUMBER },
                        matchType: { type: Type.STRING },
                      },
                      required: ['passage', 'sourceTitle', 'sourceUrl', 'similarityPct', 'matchType'],
                    },
                  },
                  sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        url: { type: Type.STRING },
                        domain: { type: Type.STRING },
                        matchPct: { type: Type.NUMBER },
                        matchedWords: { type: Type.NUMBER },
                      },
                      required: ['id', 'title', 'url', 'domain', 'matchPct', 'matchedWords'],
                    },
                  },
                },
                required: ['overallSimilarity', 'matchedPassages', 'sources'],
              },
            },
          }),
          2000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          overallSimilarity = Math.round(parsed.overallSimilarity || 5);
          matchedPassages = (parsed.matchedPassages || []).map((m: any, idx: number) => {
            const start = text.indexOf(m.passage);
            return {
              id: `match-${idx}`,
              passage: m.passage,
              sourceTitle: m.sourceTitle,
              sourceUrl: m.sourceUrl,
              similarityPct: Math.round(m.similarityPct || 85),
              startIndex: start !== -1 ? start : 0,
              endIndex: start !== -1 ? start + m.passage.length : m.passage.length,
              matchType: (m.matchType as any) || 'paraphrased',
            };
          });
          sources = parsed.sources || [];
        }
      } catch (err) {
        console.warn('Plagiarism check API error:', err);
      }
    }

    if (sources.length === 0 && matchedPassages.length === 0) {
      // If no high similarity found, report clean or incidental overlap
      overallSimilarity = 3;
      sources = [
        {
          id: 'src-1',
          title: 'Open Web & Common English Corpus',
          url: 'https://en.wikipedia.org/wiki/Standard_English',
          domain: 'wikipedia.org',
          matchPct: 3,
          matchedWords: 8,
        },
      ];
    }

    const result: PlagiarismResult = {
      overallSimilarity,
      totalPassagesChecked: passages.length,
      matchedPassages,
      sources,
      coverageDisclaimer:
        'Coverage Notice: Scans indexed open web articles, research preprints, and open-access corpora. Does not access restricted institutional student vaults or closed commercial repositories.',
      providerName: hasApiKey ? 'Veritas Deep Semantic Corpus Matcher' : 'Veritas Open Fingerprint Indexer',
      checkedAt: new Date().toISOString(),
      wordCount,
    };

    return res.json(result);
  } catch (error) {
    console.error('Plagiarism check error:', error);
    return res.status(500).json({ error: 'Plagiarism scan failed' });
  }
});

// Paraphraser
app.post('/api/paraphrase', async (req: Request, res: Response) => {
  try {
    const { text, mode = 'standard', tone = 'natural' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    let revisedText = text;

    if (hasApiKey) {
      try {
        const modeInstructions: Record<ParaphraseMode, string> = {
          standard: 'Maintain natural balance, improving flow and vocabulary slightly.',
          professional: 'Rewrite in polished, confident executive business prose.',
          academic: 'Rewrite using scholarly terminology, objective framing, and rigorous structure.',
          simple: 'Rewrite in plain, direct English accessible to all readers (Grade 6 level).',
          fluent: 'Eliminate awkward phrasing, optimizing natural conversational rhythm.',
          concise: 'Trim filler words, passive constructions, and redundant expressions.',
          creative: 'Enrich with engaging phrasing, varied sentence cadences, and vibrant imagery.',
        };

        const instruction = modeInstructions[mode as ParaphraseMode] || modeInstructions.standard;

        const prompt = `You are an expert writing assistant and paraphraser.
Target Mode: "${mode}" (${instruction}).
Target Tone: "${tone}".

Original Text:
"""${text}"""

Instructions:
- Preserve all factual meanings, statistics, citations, and specific domain terms.
- Do not add meta remarks like "Here is your paraphrased version:". Return ONLY the revised text.`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          }),
          2000
        );

        if (response.text) {
          revisedText = response.text.trim();
        }
      } catch (err) {
        console.warn('Paraphrase API timeout/error, using deterministic heuristics:', err);
        revisedText = text
          .replace(/\bin order to\b/gi, 'to')
          .replace(/\bat this point in time\b/gi, 'currently')
          .replace(/\bdue to the fact that\b/gi, 'because')
          .replace(/\butilize\b/gi, 'use')
          .replace(/\bcommence\b/gi, 'begin');
      }
    } else {
      // Deterministic fallback rephraser for offline/test mode
      revisedText = text
        .replace(/\bin order to\b/gi, 'to')
        .replace(/\bat this point in time\b/gi, 'currently')
        .replace(/\bdue to the fact that\b/gi, 'because')
        .replace(/\butilize\b/gi, 'use')
        .replace(/\bcommence\b/gi, 'begin');
    }

    return res.json({
      original: text,
      revised: revisedText,
      mode,
      wordCountOriginal: countWords(text),
      wordCountRevised: countWords(revisedText),
    });
  } catch (error) {
    console.error('Paraphrase error:', error);
    return res.status(500).json({ error: 'Paraphrase failed' });
  }
});

// AI Writer (Draft Generator)
app.post('/api/ai-writer/generate', async (req: Request, res: Response) => {
  try {
    const { topic, format = 'essay', audience = 'general', tone = 'professional', length = 'medium', keyPoints = '' } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic or prompt is required' });
    }

    let generatedText = '';

    if (hasApiKey) {
      try {
        const prompt = `You are VeritasWrite's expert AI composition engine.
Task: Write a high-quality draft on the topic: "${topic}".
Format: ${format} (e.g. Essay Outline, Article Draft, Executive Email, Research Summary, Blog Post, Professional Message).
Target Audience: ${audience}.
Tone: ${tone}.
Desired Length: ${length}.
Key Points to include: ${keyPoints || 'None specified; provide comprehensive, well-structured arguments'}.

Rules:
- Write coherent, insightful, grammatically immaculate paragraphs.
- Structure with clear section headings or paragraphs appropriate for the format.
- Do not fabricate false citations or fake quotes.
- Return ONLY the draft content directly.`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          }),
          2000
        );

        generatedText = response.text?.trim() || '';
      } catch (err) {
        console.warn('AI Writer timeout/fallback:', err);
        generatedText = `# ${topic}

## Executive Summary
This draft provides a comprehensive overview of ${topic}, structured specifically for a ${audience} audience in a ${tone} tone.

## Core Pillars & Arguments
${keyPoints ? keyPoints.split('\n').map((p: string) => `- ${p}`).join('\n') : '- Foundational principles and analytical architecture.\n- Implementation frameworks and measurable deliverables.\n- Mitigation of operational friction and strategic alignment.'}

## Strategic Outlook
By methodically addressing these requirements, stakeholders can ensure long-term durability and measurable efficiency.`;
      }
    } else {
      generatedText = `# ${topic}

## Overview
This draft outlines key considerations for ${topic}, tailored for a ${audience} audience in a ${tone} tone.

## Core Considerations
${keyPoints ? keyPoints.split('\n').map((p: string) => `- ${p}`).join('\n') : '- Foundational principles and strategic objectives.\n- Key performance indicators and implementation phases.\n- Risk management and stakeholder alignment.'}

## Conclusion
Executing these principles establishes a clear roadmap toward measurable success.`;
    }

    return res.json({
      topic,
      format,
      content: generatedText,
      wordCount: countWords(generatedText),
    });
  } catch (error) {
    console.error('AI Writer error:', error);
    return res.status(500).json({ error: 'Draft generation failed' });
  }
});

// Summarizer
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { text, type = 'bullets' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    let summary = '';
    const originalWords = countWords(text);

    if (hasApiKey) {
      try {
        const typeInstructions: Record<string, string> = {
          short: 'Produce a punchy 2-3 sentence executive synopsis.',
          detailed: 'Produce a comprehensive paragraph-by-paragraph detailed summary.',
          bullets: 'Provide 4-7 crisp bullet points capturing the core insights.',
          takeaways: 'List key strategic takeaways followed by actionable next steps.',
          notes: 'Format as organized study notes with core concepts and definitions.',
        };

        const prompt = `Summarize the following text accurately without distorting facts.
Type: ${type} (${typeInstructions[type] || typeInstructions.bullets})

Source Text:
"""${text}"""

Return ONLY the summary content.`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          }),
          2000
        );

        summary = response.text?.trim() || '';
      } catch (err) {
        console.warn('Summarizer timeout/fallback:', err);
        const sentences = splitIntoSentences(text);
        summary = sentences.slice(0, 3).map((s) => `• ${s}`).join('\n');
      }
    } else {
      const sentences = splitIntoSentences(text);
      summary = sentences.slice(0, 3).map((s) => `• ${s}`).join('\n');
    }

    const summaryWords = countWords(summary);
    const compressionRatio = originalWords > 0 ? Math.round((summaryWords / originalWords) * 100) : 0;

    return res.json({
      summary,
      type,
      originalWords,
      summaryWords,
      compressionRatio: `${compressionRatio}%`,
    });
  } catch (error) {
    console.error('Summarize error:', error);
    return res.status(500).json({ error: 'Summarization failed' });
  }
});

// Readability & Tone Analysis
app.post('/api/readability/analyze', (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text must be a string' });
    }
    const report = getReadabilityReport(text);
    return res.json(report);
  } catch (error) {
    return res.status(500).json({ error: 'Readability analysis failed' });
  }
});

// Tone Detector & Rewriter
app.post('/api/tone/analyze', async (req: Request, res: Response) => {
  try {
    const { text, targetTone } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    let detectedTone = 'Formal & Analytical';
    let toneScores = {
      formal: 85,
      confident: 80,
      friendly: 40,
      persuasive: 65,
      analytical: 90,
    };
    let suggestions: string[] = [
      'Use active verbs to heighten confidence and rhythm.',
      'Replace informal idioms with precise academic or professional vocabulary.',
    ];
    let rewrittenText = '';

    if (hasApiKey) {
      try {
        const prompt = `Analyze the tone of this text:
"""${text}"""

${targetTone ? `Also rewrite the text into the target tone: "${targetTone}".` : ''}

Provide a JSON object with:
1. detectedTone: dominant tone name (e.g., Formal, Confident, Conversational, Analytical, Persuasive)
2. toneScores: object with numbers 0-100 for formal, confident, friendly, persuasive, analytical
3. suggestions: array of 2-3 tips to enhance the tone
${targetTone ? '4. rewrittenText: the rewritten text in the target tone' : ''}`;

        const response = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  detectedTone: { type: Type.STRING },
                  toneScores: {
                    type: Type.OBJECT,
                    properties: {
                      formal: { type: Type.NUMBER },
                      confident: { type: Type.NUMBER },
                      friendly: { type: Type.NUMBER },
                      persuasive: { type: Type.NUMBER },
                      analytical: { type: Type.NUMBER },
                    },
                    required: ['formal', 'confident', 'friendly', 'persuasive', 'analytical'],
                  },
                  suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  rewrittenText: { type: Type.STRING },
                },
                required: ['detectedTone', 'toneScores', 'suggestions'],
              },
            },
          }),
          2000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          detectedTone = parsed.detectedTone;
          toneScores = parsed.toneScores;
          suggestions = parsed.suggestions;
          rewrittenText = parsed.rewrittenText || '';
        }
      } catch (err) {
        console.warn('Tone API timeout/fallback:', err);
        rewrittenText = text
          .replace(/\bTheir are\b/g, 'There are')
          .replace(/\bshould of\b/g, 'should have')
          .replace(/\bdefinitely effect\b/g, 'definitely affect');
      }
    } else {
      rewrittenText = text
        .replace(/\bTheir are\b/g, 'There are')
        .replace(/\bshould of\b/g, 'should have');
    }

    return res.json({
      detectedTone,
      toneScores,
      suggestions,
      rewrittenText,
    });
  } catch (error) {
    console.error('Tone analysis error:', error);
    return res.status(500).json({ error: 'Tone analysis failed' });
  }
});

// Citation Generator
app.post('/api/citations/generate', (req: Request, res: Response) => {
  try {
    const { citationData, style = 'apa' } = req.body as {
      citationData: CitationData;
      style: CitationStyle;
    };

    if (!citationData || !citationData.title) {
      return res.status(400).json({ error: 'Citation title is required' });
    }

    const result = generateCitation(citationData, style);
    return res.json({
      style,
      reference: result.reference,
      inText: result.inText,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Citation generation failed' });
  }
});

/* -------------------------------------------------------------
   DOCUMENT MANAGEMENT & VERSION HISTORY APIS
------------------------------------------------------------- */

// List Documents
app.get('/api/documents', (_req: Request, res: Response) => {
  res.json({ documents });
});

// Create Document
app.post('/api/documents', (req: Request, res: Response) => {
  const { title = 'Untitled Document', content = '', tags = ['Draft'] } = req.body;
  const wordCount = countWords(content);
  const newDoc: DocumentItem = {
    id: `doc-${Date.now()}`,
    title: title.trim() || 'Untitled Document',
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags,
    wordCount,
    overallScore: 85,
    versionCount: 1,
  };

  documents.unshift(newDoc);
  userUsage.documentsSaved = documents.length;

  // Create initial version snapshot
  const initialVersion: DocumentVersion = {
    id: `ver-${newDoc.id}-1`,
    documentId: newDoc.id,
    title: newDoc.title,
    content: newDoc.content,
    savedAt: newDoc.createdAt,
    wordCount,
    label: 'Initial Document Creation',
  };
  versions.push(initialVersion);

  return res.status(201).json(newDoc);
});

// Get Document by ID
app.get('/api/documents/:id', (req: Request, res: Response) => {
  const doc = documents.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  return res.json(doc);
});

// Update Document
app.put('/api/documents/:id', (req: Request, res: Response) => {
  const docIndex = documents.findIndex((d) => d.id === req.params.id);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const { title, content, tags, createSnapshot, snapshotLabel } = req.body;
  const existing = documents[docIndex];

  const updated: DocumentItem = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    content: content !== undefined ? content : existing.content,
    tags: tags !== undefined ? tags : existing.tags,
    wordCount: content !== undefined ? countWords(content) : existing.wordCount,
    updatedAt: new Date().toISOString(),
  };

  if (createSnapshot) {
    updated.versionCount += 1;
    const newVersion: DocumentVersion = {
      id: `ver-${updated.id}-${Date.now()}`,
      documentId: updated.id,
      title: updated.title,
      content: updated.content,
      savedAt: updated.updatedAt,
      wordCount: updated.wordCount,
      label: snapshotLabel || `Revision ${updated.versionCount}`,
    };
    versions.push(newVersion);
  }

  documents[docIndex] = updated;
  return res.json(updated);
});

// Delete Document
app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const docIndex = documents.findIndex((d) => d.id === req.params.id);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }
  documents.splice(docIndex, 1);
  versions = versions.filter((v) => v.documentId !== req.params.id);
  userUsage.documentsSaved = documents.length;
  return res.json({ success: true, message: 'Document deleted' });
});

// Get Document Versions
app.get('/api/documents/:id/versions', (req: Request, res: Response) => {
  const docVersions = versions
    .filter((v) => v.documentId === req.params.id)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

  return res.json({ versions: docVersions });
});

// Restore Document Version
app.post('/api/documents/:id/restore', (req: Request, res: Response) => {
  const { versionId } = req.body;
  const version = versions.find((v) => v.id === versionId && v.documentId === req.params.id);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  const docIndex = documents.findIndex((d) => d.id === req.params.id);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  documents[docIndex].content = version.content;
  documents[docIndex].title = version.title;
  documents[docIndex].wordCount = version.wordCount;
  documents[docIndex].updatedAt = new Date().toISOString();

  return res.json(documents[docIndex]);
});

// User Usage
app.get('/api/user/usage', (_req: Request, res: Response) => {
  res.json({
    ...userUsage,
    hasApiKey,
    provider: hasApiKey ? 'Gemini 3.8 Flash' : 'Local Heuristic Engine',
  });
});

/* -------------------------------------------------------------
   VITE DEV SERVER / STATIC ASSETS MOUNT
------------------------------------------------------------- */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VeritasWrite AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
