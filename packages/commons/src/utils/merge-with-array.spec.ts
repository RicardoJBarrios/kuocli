import { mergeWithArray } from './merge-with-array';

describe('mergeWithArray', () => {
  it(`merges array values`, () => {
    const object = { a: [1], b: [2] };
    const other = { a: [3], b: [4] };
    expect(mergeWithArray(object, other)).toEqual({ a: [1, 3], b: [2, 4] });
  });
});
