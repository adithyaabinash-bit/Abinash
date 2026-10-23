import test from 'node:test';
import assert from 'node:assert/strict';
import { countSyllables, getReadabilityReport, isComplexWord } from '../src/utils/readability';

test('countSyllables accurately counts simple and multisyllabic words', () => {
  assert.equal(countSyllables('the'), 1);
  assert.equal(countSyllables('writing'), 2);
  assert.equal(countSyllables('complex'), 2);
  assert.equal(countSyllables('intelligent'), 4);
  assert.equal(countSyllables('communication'), 5);
});

test('isComplexWord identifies words with 3 or more syllables', () => {
  assert.equal(isComplexWord('cat'), false);
  assert.equal(isComplexWord('simple'), false);
  assert.equal(isComplexWord('understand'), true);
  assert.equal(isComplexWord('sophisticated'), true);
});

test('getReadabilityReport handles empty text gracefully', () => {
  const report = getReadabilityReport('');
  assert.equal(report.fleschReadingEase, 100);
  assert.equal(report.fleschKincaidGrade, 0);
  assert.equal(report.gunningFogIndex, 0);
});

test('getReadabilityReport calculates valid scores for sample paragraphs', () => {
  const sample =
    'The quick brown fox jumps over the lazy dog. Writing clearly is an essential skill for professionals. It helps avoid misunderstandings and improves productivity.';
  const report = getReadabilityReport(sample);

  assert.ok(report.fleschReadingEase > 0 && report.fleschReadingEase <= 100);
  assert.ok(report.fleschKincaidGrade >= 0);
  assert.ok(report.gunningFogIndex >= 0);
  assert.ok(report.averageSentenceLength > 0);
  assert.ok(Array.isArray(report.suggestions));
});
