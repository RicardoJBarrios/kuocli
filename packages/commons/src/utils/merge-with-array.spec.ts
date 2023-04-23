import { mergeWithArray } from './merge-with-array';

describe('mergeWithArray', () => {
  it(`merges objects`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { b: 0 } };
    expect(mergeWithArray(a, b)).toEqual({ a: { a: 0, b: 0 } });
  });

  it(`merges array values`, () => {
    const a = { a: ['1'] };
    const b = { a: ['2', '3'] };
    expect(mergeWithArray(a, b)).toEqual({ a: ['1', '2', '3'] });
  });

  it(`avoid duplicated array values`, () => {
    const a = { a: ['1'] };
    const b = { a: ['1', '3'] };
    expect(mergeWithArray(a, b)).toEqual({ a: ['1', '3'] });
  });
});
