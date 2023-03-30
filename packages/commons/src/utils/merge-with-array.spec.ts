import { mergeWithArray } from './merge-with-array';

describe('mergeWithArray', () => {
  it(`merges array values`, () => {
    expect(mergeWithArray({ a: ['1'] }, { a: ['2', '3'] })).toEqual({ a: ['1', '2', '3'] });
  });

  it(`avoid duplicated array values`, () => {
    expect(mergeWithArray({ a: ['1'] }, { a: ['1', '3'] })).toEqual({ a: ['1', '3'] });
  });
});
