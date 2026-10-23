import { WritingIssue } from '../types/writing';

/**
 * Applies a text replacement and returns the updated text.
 */
export function applyReplacement(
  text: string,
  startIndex: number,
  endIndex: number,
  replacement: string
): string {
  if (startIndex < 0 || endIndex > text.length || startIndex > endIndex) {
    return text;
  }
  return text.slice(0, startIndex) + replacement + text.slice(endIndex);
}

/**
 * Adjusts all remaining issues' start and end indices after an edit at appliedIndex.
 */
export function recalculateOffsets(
  issues: WritingIssue[],
  appliedIndex: number,
  lengthDelta: number
): WritingIssue[] {
  return issues.map((issue) => {
    if (issue.startIndex > appliedIndex) {
      return {
        ...issue,
        startIndex: issue.startIndex + lengthDelta,
        endIndex: issue.endIndex + lengthDelta,
      };
    }
    return issue;
  });
}

interface GrammarRulePattern {
  id: string;
  name: string;
  pattern: RegExp;
  category: WritingIssue['category'];
  severity: WritingIssue['severity'];
  getReplacement: (match: RegExpExecArray) => string;
  getExplanation: (match: RegExpExecArray) => string;
}

const BUILT_IN_RULES: GrammarRulePattern[] = [
  // Repeated consecutive words (e.g. "the the")
  {
    id: 'duplicate-word',
    name: 'Duplicate Word',
    pattern: /\b([a-zA-Z]+)\s+\1\b/gi,
    category: 'grammar',
    severity: 'error',
    getReplacement: (match) => match[1],
    getExplanation: (match) => `Repeated word "${match[1]}". Consider removing the duplicate.`,
  },
  // "could of", "should of", "would of"
  {
    id: 'could-of',
    name: 'Modal Auxiliary Verb',
    pattern: /\b(could|should|would|might|must)\s+of\b/gi,
    category: 'grammar',
    severity: 'error',
    getReplacement: (match) => `${match[1]} have`,
    getExplanation: (match) =>
      `Use "${match[1]} have" instead of "${match[0]}" in formal English.`,
  },
  // "irregardless"
  {
    id: 'irregardless',
    name: 'Nonstandard Word',
    pattern: /\birregardless\b/gi,
    category: 'vocabulary',
    severity: 'warning',
    getReplacement: () => 'regardless',
    getExplanation: () => '"Irregardless" is nonstandard. Use "regardless" instead.',
  },
  // Spacing before comma or period (e.g. "word , next")
  {
    id: 'space-before-punctuation',
    name: 'Punctuation Spacing',
    pattern: /\s+([,.:;?!])/g,
    category: 'punctuation',
    severity: 'warning',
    getReplacement: (match) => match[1],
    getExplanation: () => 'Unexpected space before punctuation mark.',
  },
  // Missing space after comma or period (e.g. "hello,world")
  {
    id: 'space-after-comma',
    name: 'Spacing After Comma',
    pattern: /,([a-zA-Z])/g,
    category: 'punctuation',
    severity: 'warning',
    getReplacement: (match) => `, ${match[1]}`,
    getExplanation: () => 'Missing space after comma.',
  },
  // "a" before vowel sound / "an" before consonant
  {
    id: 'article-a-vowel',
    name: 'Indefinite Article',
    pattern: /\ba\s+([aeio][a-z]+)\b/gi,
    category: 'grammar',
    severity: 'error',
    getReplacement: (match) => `an ${match[1]}`,
    getExplanation: (match) => `Use "an" before words starting with a vowel sound like "${match[1]}".`,
  },
  {
    id: 'article-an-consonant',
    name: 'Indefinite Article',
    pattern: /\ban\s+([bcdfghjklmnpqrstvwxyz][a-z]+)\b/gi,
    category: 'grammar',
    severity: 'error',
    getReplacement: (match) => `a ${match[1]}`,
    getExplanation: (match) =>
      `Use "a" before words starting with a consonant sound like "${match[1]}".`,
  },
  // "their" vs "there" vs "they're" common flags
  {
    id: 'their-are',
    name: 'Homophone Confusion',
    pattern: /\btheir\s+(are|is|were|was)\b/gi,
    category: 'spelling',
    severity: 'error',
    getReplacement: (match) => `there ${match[1]}`,
    getExplanation: (match) =>
      `Did you mean "there ${match[1]}" indicating existence, rather than the possessive "their"?`,
  },
  // "definitely effect" / "will effect"
  {
    id: 'affect-effect',
    name: 'Affect vs. Effect',
    pattern: /\b(will|definitely|greatly|negatively|positively)\s+effect\b/gi,
    category: 'grammar',
    severity: 'error',
    getReplacement: (match) => `${match[1]} affect`,
    getExplanation: (match) =>
      `"Affect" is typically a verb meaning to influence, while "effect" is typically a noun.`,
  },
  // "alot"
  {
    id: 'a-lot',
    name: 'Spelling Error',
    pattern: /\balot\b/gi,
    category: 'spelling',
    severity: 'error',
    getReplacement: () => 'a lot',
    getExplanation: () => '"alot" is not a word. Use "a lot" instead.',
  },
  // "in order to" -> "to" (conciseness)
  {
    id: 'in-order-to',
    name: 'Conciseness',
    pattern: /\bin order to\b/gi,
    category: 'conciseness',
    severity: 'suggestion',
    getReplacement: () => 'to',
    getExplanation: () => '"In order to" can often be simplified to "to" without losing meaning.',
  },
  // "at this point in time" -> "now" / "currently"
  {
    id: 'at-this-point-in-time',
    name: 'Wordy Phrase',
    pattern: /\bat this point in time\b/gi,
    category: 'conciseness',
    severity: 'suggestion',
    getReplacement: () => 'currently',
    getExplanation: () => 'Replace wordy phrase with "now" or "currently".',
  },
  // "due to the fact that" -> "because"
  {
    id: 'due-to-the-fact-that',
    name: 'Wordy Phrase',
    pattern: /\bdue to the fact that\b/gi,
    category: 'conciseness',
    severity: 'suggestion',
    getReplacement: () => 'because',
    getExplanation: () => 'Replace with "because" for cleaner pacing.',
  },
];

/**
 * Fast local heuristics for finding grammar, spelling, and conciseness issues.
 */
export function findRuleBasedIssues(text: string): WritingIssue[] {
  if (!text || !text.trim()) return [];
  const issues: WritingIssue[] = [];

  for (const rule of BUILT_IN_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const originalText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + originalText.length;
      const replacement = rule.getReplacement(match);
      const explanation = rule.getExplanation(match);

      issues.push({
        id: `rule-${rule.id}-${startIndex}`,
        originalText,
        replacement,
        explanation,
        category: rule.category,
        severity: rule.severity,
        startIndex,
        endIndex,
        ruleName: rule.name,
      });
    }
  }

  // Sort by start position
  return issues.sort((a, b) => a.startIndex - b.startIndex);
}
