import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCitation } from '../src/utils/citationFormatter';
import { CitationData } from '../src/types/writing';

test('generateCitation formats APA 7th style correctly', () => {
  const data: CitationData = {
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
    year: '2017',
    sourceOrJournal: 'Advances in Neural Information Processing Systems',
    volume: '30',
    pages: '5998-6008',
    doiOrUrl: 'https://doi.org/10.5555/3295222.3295349',
    type: 'journal',
  };

  const { reference, inText } = generateCitation(data, 'apa');
  assert.ok(reference.includes('Vaswani, A.'));
  assert.ok(reference.includes('(2017)'));
  assert.ok(reference.includes('Attention Is All You Need'));
  assert.ok(inText.includes('Vaswani et al., 2017'));
});

test('generateCitation formats MLA style correctly', () => {
  const data: CitationData = {
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald'],
    year: '1925',
    publisher: 'Charles Scribner\'s Sons',
    type: 'book',
  };

  const { reference, inText } = generateCitation(data, 'mla');
  assert.ok(reference.includes('Fitzgerald'));
  assert.ok(reference.includes('"The Great Gatsby."') || reference.includes('The Great Gatsby'));
  assert.ok(inText.includes('Fitzgerald'));
});
