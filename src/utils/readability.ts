import { countWords, splitIntoSentences, detectPassiveVoice } from './textMetrics';
import { ReadabilityMetrics } from '../types/writing';

/**
 * Approximate syllable counter for English words.
 */
export function countSyllables(word: string): number {
  if (!word) return 0;
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;

  // Remove standard non-pronounced endings
  let processed = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');

  const vowelMatches = processed.match(/[aeiouy]{1,2}/g);
  return vowelMatches ? Math.max(1, vowelMatches.length) : 1;
}

export function isComplexWord(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  // Ignore common prefixes/suffixes if short, or count >= 3 syllables
  if (clean.length < 5) return false;
  return countSyllables(clean) >= 3;
}

export function getReadabilityReport(text: string): ReadabilityMetrics {
  const words = text
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w) => w.length > 0);

  const wordCount = words.length;
  const sentences = splitIntoSentences(text);
  const sentenceCount = Math.max(1, sentences.length);

  if (wordCount === 0) {
    return {
      fleschReadingEase: 100,
      fleschKincaidGrade: 0,
      gunningFogIndex: 0,
      readingEaseLabel: 'Very Easy (Score: 100)',
      gradeLevelLabel: 'Elementary',
      averageSentenceLength: 0,
      averageWordLength: 0,
      complexWordsPercentage: 0,
      passiveVoiceCount: 0,
      passiveVoicePercentage: 0,
      hardSentencesCount: 0,
      veryHardSentencesCount: 0,
      suggestions: ['Write some text to see readability insights.'],
    };
  }

  // Count total syllables & complex words
  let totalSyllables = 0;
  let complexWordsCount = 0;
  let totalCharsInWords = 0;

  for (const w of words) {
    const syl = countSyllables(w);
    totalSyllables += syl;
    totalCharsInWords += w.length;
    if (isComplexWord(w)) {
      complexWordsCount++;
    }
  }

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;
  const complexWordsPct = Math.round((complexWordsCount / wordCount) * 100);

  // Flesch Reading Ease: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  let flesch = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  flesch = Math.min(100, Math.max(0, Math.round(flesch * 10) / 10));

  // Flesch-Kincaid Grade: 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
  let fkGrade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  fkGrade = Math.max(0, Math.round(fkGrade * 10) / 10);

  // Gunning Fog Index: 0.4 * ( (words / sentences) + 100 * (complexWords / words) )
  let fog = 0.4 * (avgSentenceLength + (complexWordsCount / wordCount) * 100);
  fog = Math.max(0, Math.round(fog * 10) / 10);

  // Interpretations
  let readingEaseLabel = 'Standard';
  if (flesch >= 90) readingEaseLabel = 'Very Easy (5th Grade)';
  else if (flesch >= 80) readingEaseLabel = 'Easy (6th Grade)';
  else if (flesch >= 70) readingEaseLabel = 'Fairly Easy (7th Grade)';
  else if (flesch >= 60) readingEaseLabel = 'Standard / Plain English (8th-9th Grade)';
  else if (flesch >= 50) readingEaseLabel = 'Fairly Difficult (10th-12th Grade)';
  else if (flesch >= 30) readingEaseLabel = 'Difficult (College)';
  else readingEaseLabel = 'Very Difficult (Postgraduate / Technical)';

  let gradeLevelLabel = 'General Audience';
  if (fkGrade <= 6) gradeLevelLabel = 'Elementary';
  else if (fkGrade <= 8) gradeLevelLabel = 'Middle School';
  else if (fkGrade <= 12) gradeLevelLabel = 'High School';
  else if (fkGrade <= 16) gradeLevelLabel = 'College Undergrad';
  else gradeLevelLabel = 'Graduate / Specialist';

  // Sentence complexity count
  let hardSentencesCount = 0;
  let veryHardSentencesCount = 0;
  for (const s of sentences) {
    const sWords = countWords(s);
    if (sWords > 25) veryHardSentencesCount++;
    else if (sWords > 18) hardSentencesCount++;
  }

  const passive = detectPassiveVoice(text);
  const passiveVoicePercentage = Math.round((passive.count / sentenceCount) * 100);

  const suggestions: string[] = [];
  if (veryHardSentencesCount > 0) {
    suggestions.push(
      `${veryHardSentencesCount} sentence(s) exceed 25 words. Consider splitting them to improve pacing.`
    );
  }
  if (complexWordsPct > 20) {
    suggestions.push(
      `${complexWordsPct}% of your words are complex (3+ syllables). Simplify vocabulary where possible for a wider audience.`
    );
  }
  if (passiveVoicePercentage > 25) {
    suggestions.push(
      `High passive voice usage (${passiveVoicePercentage}% of sentences). Converting to active voice makes writing more direct and engaging.`
    );
  }
  if (suggestions.length === 0) {
    suggestions.push('Excellent clarity and readability across all tested parameters!');
  }

  return {
    fleschReadingEase: flesch,
    fleschKincaidGrade: fkGrade,
    gunningFogIndex: fog,
    readingEaseLabel,
    gradeLevelLabel,
    averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    averageWordLength: Math.round((totalCharsInWords / wordCount) * 10) / 10,
    complexWordsPercentage: complexWordsPct,
    passiveVoiceCount: passive.count,
    passiveVoicePercentage,
    hardSentencesCount,
    veryHardSentencesCount,
    suggestions,
  };
}
