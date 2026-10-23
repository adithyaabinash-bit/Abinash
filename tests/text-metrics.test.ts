import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countWords,
  countCharacters,
  splitIntoSentences,
  calculateReadingTime,
  detectPassiveVoice,
} from '../src/utils/textMetrics';

test('countWords accurately counts word tokens with variable spacing', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   '), 0);
  assert.equal(countWords('Hello world'), 2);
  assert.equal(countWords('   The   quick brown   fox  '), 4);
});

test('countCharacters accurately returns raw and no-space counts', () => {
  const res = countCharacters('a b c');
  assert.equal(res.chars, 5);
  assert.equal(res.charsNoSpaces, 3);
});

test('splitIntoSentences breaks paragraphs on sentence delimiters', () => {
  const text = 'First sentence. Second sentence! Is this the third? Yes it is.';
  const s = splitIntoSentences(text);
  assert.equal(s.length, 4);
});

test('calculateReadingTime gives reasonable estimate for standard reading speeds', () => {
  assert.equal(calculateReadingTime(220), 1);
  assert.equal(calculateReadingTime(440), 2);
  assert.equal(calculateReadingTime(50), 1); // Minimum 1 min
});

test('detectPassiveVoice identifies passive verb phrases', () => {
  const text = 'The proposal was approved by the committee, and the report was written yesterday.';
  const res = detectPassiveVoice(text);
  assert.ok(res.count >= 2);
  assert.ok(res.matches.includes('was approved'));
  assert.ok(res.matches.includes('was written'));
});
