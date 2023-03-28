import { cleanStringArray } from './clean-string-array';

describe('cleanStringArray', () => {
  it(`removes duplicated values`, () => {
    const array: string[] = [' a', 'b', 'a '];
    expect(cleanStringArray(array)).toEqual(['a', 'b']);
  });

  it(`removes nil and empty values`, () => {
    const array: string[] = ['', '', '   ', 'a', null, undefined];
    expect(cleanStringArray(array)).toEqual(['a']);
  });

  it(`removes value's ending and trailing white space`, () => {
    const array: string[] = ['  a  ', 'b  ', '  c'];
    expect(cleanStringArray(array)).toEqual(['a', 'b', 'c']);
  });
});
