import { cleanArray } from './clean-array';

describe('cleanArray', () => {
  it(`removes duplicated values`, () => {
    const array: string[] = [' a', 'b', 'a '];
    expect(cleanArray(array)).toEqual(['a', 'b']);
  });

  it(`removes nil and empty values`, () => {
    const array: string[] = ['', '', '   ', 'a', null, undefined];
    expect(cleanArray(array)).toEqual(['a']);
  });

  it(`removes value's ending and trailing white space`, () => {
    const array: string[] = ['  a  ', 'b  ', '  c'];
    expect(cleanArray(array)).toEqual(['a', 'b', 'c']);
  });
});
