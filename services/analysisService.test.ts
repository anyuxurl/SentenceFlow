import { describe, it, expect } from 'vitest';
import { extractJson, normalizeResult } from './analysisService';

/**
 * These two functions absorb everything the model does wrong. They are the most
 * likely thing in the codebase to break silently when an upstream model changes
 * its formatting habits, and they are pure — so they are what is worth testing.
 */

describe('extractJson', () => {
  it('passes clean JSON through untouched', () => {
    expect(extractJson('{"a":1}')).toBe('{"a":1}');
  });

  it('unwraps a ```json fence', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('unwraps a bare fence with no language tag', () => {
    expect(extractJson('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('strips prose before and after the object', () => {
    expect(extractJson('Sure! Here you go:\n{"a":1}\nHope that helps.')).toBe('{"a":1}');
  });

  it('handles a fence wrapped in prose', () => {
    expect(extractJson('Here:\n```json\n{"a":1}\n```\nDone.')).toBe('{"a":1}');
  });

  it('keeps nested braces intact', () => {
    const nested = '{"a":{"b":[1,2]},"c":"}"}';
    expect(extractJson(`noise ${nested} noise`)).toBe(nested);
  });

  it('leaves input with no object alone rather than mangling it', () => {
    expect(extractJson('I cannot help with that.')).toBe('I cannot help with that.');
  });
});

describe('normalizeResult', () => {
  const LIMIT = 500;

  it('keeps a well-formed result', () => {
    const result = normalizeResult({
      translation: '狐狸跳过了狗。',
      components: [{ part: '主语', text: 'The fox' }],
      clauses: [{ type: '定语从句', text: 'which ran', explanation: '修饰 fox' }],
      grammarCheck: [{ original: 'a', correction: 'an', explanation: '元音前用 an' }],
    }, LIMIT);

    expect(result.translation).toBe('狐狸跳过了狗。');
    expect(result.components).toHaveLength(1);
    expect(result.clauses[0].explanation).toBe('修饰 fox');
    expect(result.grammarCheck[0].correction).toBe('an');
  });

  // The UI maps over these arrays and reads .length unguarded, so a wrong type
  // must never reach it.
  it.each([
    ['null', null],
    ['a string', 'nope'],
    ['an array', []],
    ['an empty object', {}],
    ['arrays typed as objects', { components: {}, clauses: 'x', grammarCheck: 42 }],
  ])('returns empty arrays for %s', (_label, input) => {
    const result = normalizeResult(input, LIMIT);
    expect(result.translation).toBe('');
    expect(result.components).toEqual([]);
    expect(result.clauses).toEqual([]);
    expect(result.grammarCheck).toEqual([]);
  });

  it('drops entries whose text is missing or wrongly typed', () => {
    const result = normalizeResult({
      components: [
        { part: '主语', text: 'kept' },
        { part: '谓语' },
        { part: '宾语', text: 42 },
        null,
      ],
    }, LIMIT);
    expect(result.components).toEqual([{ part: '主语', text: 'kept' }]);
  });

  it('keeps a grammar entry that has only one side of the correction', () => {
    const result = normalizeResult({
      grammarCheck: [{ original: 'teh', explanation: '拼写' }],
    }, LIMIT);
    expect(result.grammarCheck).toHaveLength(1);
  });

  it('caps free-text fields at the limit', () => {
    const result = normalizeResult({
      translation: 'x'.repeat(5000),
      clauses: [{ type: 't', text: 'c', explanation: 'y'.repeat(5000) }],
    }, LIMIT);
    expect(result.translation).toHaveLength(LIMIT);
    expect(result.clauses[0].explanation).toHaveLength(LIMIT);
  });

  it('caps array length', () => {
    const result = normalizeResult({
      components: Array.from({ length: 500 }, (_, i) => ({ part: 'p', text: `t${i}` })),
    }, LIMIT);
    expect(result.components).toHaveLength(50);
  });

  it('does not truncate output that is within the limit', () => {
    const translation = '这是一个正常长度的译文。';
    expect(normalizeResult({ translation }, LIMIT).translation).toBe(translation);
  });
});
