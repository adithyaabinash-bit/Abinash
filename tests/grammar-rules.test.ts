import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyReplacement,
  recalculateOffsets,
  findRuleBasedIssues,
} from '../src/utils/grammarRules';
import { WritingIssue } from '../src/types/writing';

test('applyReplacement replaces exact substring at offsets', () => {
  const original = 'This is a test of replacement.';
  const replaced = applyReplacement(original, 10, 14, 'check');
  assert.equal(replaced, 'This is a check of replacement.');
});

test('applyReplacement rejects out of boundary indices safely', () => {
  const original = 'Hello world';
  assert.equal(applyReplacement(original, -1, 5, 'Hi'), 'Hello world');
  assert.equal(applyReplacement(original, 5, 20, 'Hi'), 'Hello world');
});

test('recalculateOffsets shifts downstream issue offsets', () => {
  const issues: WritingIssue[] = [
    {
      id: '1',
      originalText: 'their',
      replacement: 'there',
      explanation: 'test',
      category: 'spelling',
      severity: 'error',
      startIndex: 0,
      endIndex: 5,
    },
    {
      id: '2',
      originalText: 'alot',
      replacement: 'a lot',
      explanation: 'test',
      category: 'spelling',
      severity: 'error',
      startIndex: 20,
      endIndex: 24,
    },
  ];

  // If issue 1 was replaced with something 3 characters longer ("there" -> "there is" +3)
  const adjusted = recalculateOffsets(issues, 0, 3);
  assert.equal(adjusted[0].startIndex, 0); // Not after appliedIndex
  assert.equal(adjusted[1].startIndex, 23); // Shifted by +3
  assert.equal(adjusted[1].endIndex, 27);
});

test('findRuleBasedIssues detects duplicate words and spacing errors', () => {
  const text = 'I went to the the store , and saw alot of items.';
  const issues = findRuleBasedIssues(text);

  assert.ok(issues.length >= 3);
  const duplicates = issues.filter((i) => i.ruleName === 'Duplicate Word');
  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].replacement, 'the');

  const punctuationIssues = issues.filter((i) => i.category === 'punctuation');
  assert.ok(punctuationIssues.length > 0);

  const spellingIssues = issues.filter((i) => i.category === 'spelling');
  assert.ok(spellingIssues.some((i) => i.originalText === 'alot'));
});
