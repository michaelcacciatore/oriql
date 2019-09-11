const { isNestedObject, isSource } = require('../../compile/helpers');

describe('isNestedObject', () => {
  it('should return false for an string type', () => {
    const obj = 'string';

    expect(isNestedObject(obj)).toBe(false);
  });
  it('should return false for an array of strings type', () => {
    const obj = ['string'];

    expect(isNestedObject(obj)).toBe(false);
  });
  it('should return false for an array of objects that has a type key', () => {
    /**
     * I'm pretty sure this is intended behavior
     */
    const obj = [
      {
        type: 'string',
      },
    ];

    expect(isNestedObject(obj)).toBe(false);
  });
  it('should return false for an object that has a type key', () => {
    const obj = {
      type: 'string',
    };

    expect(isNestedObject(obj)).toBe(false);
  });
  it('should return false for an object that has an extends key', () => {
    const obj = {
      extends: {},
    };

    expect(isNestedObject(obj)).toBe(false);
  });
  it('should return false for an object that has an extends and a type key', () => {
    const obj = {
      type: 'string',
      extends: {},
    };

    expect(isNestedObject(obj)).toBe(false);
  });
  it('should return true for an object that has a type key but using the reserverd method', () => {
    const obj = {
      __type: 'string',
    };

    expect(isNestedObject(obj)).toBe(true);
  });
  it('should return true for an object that has an extends key but using the reserverd method', () => {
    const obj = {
      __extends: {},
    };

    expect(isNestedObject(obj)).toBe(true);
  });
});

describe('isSource', () => {
  it('returns false for an object that has a source key', () => {
    const obj = {
      source: 'string',
    };

    expect(isSource(obj)).toBe(false);
  });
  it('returns false for an object that has a source key that is also an object', () => {
    const obj = {
      source: {},
    };

    expect(isSource(obj)).toBe(false);
  });
  it('returns false for an object that has a source key that is also an object with a type key', () => {
    const obj = {
      source: {
        type: 'string',
      },
    };

    expect(isSource(obj)).toBe(false);
  });
  it('returns false for an object that has a source key that is also an object with a resolver key', () => {
    const obj = {
      source: {
        resolver: 'string',
      },
    };

    expect(isSource(obj)).toBe(false);
  });
  it('returns true for an object that has a source key that is also an object with a resolver key that is a function', () => {
    const obj = {
      source: {
        resolver: () => {},
      },
    };

    expect(isSource(obj)).toBe(true);
  });
});
