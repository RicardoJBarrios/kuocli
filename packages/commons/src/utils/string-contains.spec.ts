import { stringContains } from './string-contains';

describe('stringContains', () => {
  it(`returns false if no matches`, () => {
    const a = 'a';
    const b = 'b';
    expect(stringContains(a, b)).toEqual(false);
  });

  it(`returns true if full matches`, () => {
    const a = 'a';
    const b = 'a';
    expect(stringContains(a, b)).toEqual(true);
  });

  it(`returns false if partial matches`, () => {
    const a = 'aa';
    const b = 'a';
    expect(stringContains(a, b)).toEqual(false);
  });

  it(`returns true if substring matches`, () => {
    const a = 'a b';
    const b = 'a';
    expect(stringContains(a, b)).toEqual(true);
  });
});
