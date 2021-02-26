const { normalizeAmount, maxObjVal } = require('../src/utils');

describe('Convert string amounts to a number', () => {
  test('it works with the amount as a string', () => {
    expect(normalizeAmount('12345')).toBe(12345);
    expect(typeof normalizeAmount('12345')).toBe('number');
  });

  test('it works with a string amount with commas', () => {
    expect(normalizeAmount('1,213')).toBe(1213);
    expect(normalizeAmount('1234,')).toBe(1234);
    expect(normalizeAmount(',1234')).toBe(1234);
  });

  test('it works with a string amount with multiple commas', () => {
    expect(normalizeAmount('1,234,5')).toBe(12345);
    expect(normalizeAmount(',54321,')).toBe(54321);
  });

  test('it should work with a numeric value', () => {
    expect(normalizeAmount(12345)).toBe(12345);
  });

  test('it works with a decimal value', () => {
    expect(normalizeAmount('12456.78')).toBe(12456.78);
    expect(normalizeAmount('1,234.56')).toBe(1234.56);
    expect(normalizeAmount('1,2,3,4.56')).toBe(1234.56);
  });
});

describe('finds the maximum key value pair in an object', () => {
  it('should work with text based key values', () => {
    const testObj = {
      hello: 8,
      hi: 3,
      greetings: 4,
      bonjour: 1,
      asante: 1,
      goodday: 8,
    };

    const testObj2 = {
      goodday: 8,
      hello: 8,
      hi: 3,
      greetings: 4,
      bonjour: 1,
      asante: 1,
    };

    expect(maxObjVal(testObj)).toBe('hello');
    expect(maxObjVal(testObj2)).toBe('goodday');
  });

  it('should work with number based key values', () => {
    const testObj = {
      0: 8,
      1: 3,
      2: 4,
      3: 1,
      4: 1,
      5: 8,
    };

    const testObj2 = {
      5: 8,
      0: 9,
      1: 3,
      2: 4,
      3: 1,
      4: 1,
    };

    expect(maxObjVal(testObj)).toBe("0");
    expect(maxObjVal(testObj2)).toBe("0");
  });
});
