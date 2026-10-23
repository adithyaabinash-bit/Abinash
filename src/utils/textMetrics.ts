/**
 * Core text metrics calculation utilities: word count, characters, sentences,
 * reading time, and passive voice detection.
 */

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  const cleaned = text.trim().replace(/\s+/g, ' ');
  return cleaned.split(' ').filter(Boolean).length;
}

export function countCharacters(text: string): { chars: number; charsNoSpaces: number } {
  if (!text) return { chars: 0, charsNoSpaces: 0 };
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
  };
}

export function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];
  // Split on periods, exclamation marks, question marks followed by space or end of text
  // preserving reasonable abbreviations
  const rawSentences = text
    .replace(/([.?!])\s*(?=[A-Z0-9"'])/g, '$1|---SPLIT---|')
    .split('|---SPLIT---|');

  return rawSentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function calculateReadingTime(words: number, wpm: number = 220): number {
  if (words <= 0) return 0;
  const minutes = words / wpm;
  return Math.max(1, Math.round(minutes * 10) / 10);
}

/**
 * Detect passive voice constructions like "was constructed", "has been approved", "were created by"
 */
const BE_VERBS = new Set(['is', 'are', 'was', 'were', 'be', 'been', 'being']);

export function detectPassiveVoice(text: string): { matches: string[]; count: number } {
  if (!text) return { matches: [], count: 0 };
  const words = text.split(/\s+/);
  const matches: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i].toLowerCase().replace(/[^a-z]/g, '');
    const word2 = words[i + 1].toLowerCase().replace(/[^a-z]/g, '');

    if (BE_VERBS.has(word1)) {
      // Check if word2 is a past participle (often ends in -ed, -en, -t, -wn, -ne)
      if (
        word2.endsWith('ed') ||
        word2.endsWith('en') ||
        ['built', 'written', 'made', 'done', 'taken', 'given', 'seen', 'known'].includes(word2)
      ) {
        matches.push(`${words[i]} ${words[i + 1]}`);
      }
    }
  }

  return {
    matches,
    count: matches.length,
  };
}
