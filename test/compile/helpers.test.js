jest.mock('graphql', () => ({
  isInputType: type => type === 'input',
  isOutputType: type => type === 'string',
}));
const {
  getOutputType,
  isGraphQLOutputType,
  isGraphQLInputType,
  isNestedObject,
  isSource,
} = require('../../compile/helpers');

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

describe('isGraphQLOutputType', () => {
  it('should return true if provided a valid output type', () => {
    expect(isGraphQLOutputType({ type: 'string' })).toBe(true);
  });
  it('should return true if provided a valid output type inside an array', () => {
    expect(isGraphQLOutputType({ type: ['string'] })).toBe(true);
  });
  it('should return false if provided an invalid output type', () => {
    expect(isGraphQLOutputType({ type: 'invalid' })).toBe(false);
  });
  it('should return false if provided a nested object', () => {
    expect(isGraphQLOutputType({ type: {} })).toBe(false);
  });
});
describe('isGraphQLInputType', () => {
  it('should return true if provided a valid output type', () => {
    expect(isGraphQLInputType({ type: 'input' })).toBe(true);
  });
  it('should return true if provided a valid output type inside an array', () => {
    expect(isGraphQLInputType({ type: ['input'] })).toBe(true);
  });
  it('should return false if provided an invalid output type', () => {
    expect(isGraphQLInputType({ type: 'invalid' })).toBe(false);
  });
  it('should return false if provided a nested object', () => {
    expect(isGraphQLInputType({ type: {} })).toBe(false);
  });
});
describe('getOutputType', () => {
  it('should return an object with the correct type as the field if provided a valid type object', () => {
    const type = {
      type: 'string',
    };

    expect(getOutputType(type)).toMatchObject(type);
  });
  it('should return an object with the correct type as the field if provided a valid type object inside an array', () => {
    const type = {
      type: ['string'],
    };

    const correctType = {
      type: 'string',
    };

    expect(getOutputType(type)).toMatchObject(correctType);
  });
  it('should return an object with the correct type as the field if provided a valid type', () => {
    const type = 'string';

    expect(getOutputType(type)).toMatchObject({ type });
  });
  it('should return an object with the correct type as the field if provided a valid type inside an array', () => {
    const type = ['string'];

    expect(getOutputType(type)).toMatchObject({ type: type[0] });
  });
  it('should return an empty object if provided an invalid type', () => {
    expect(getOutputType('foo')).toMatchObject({});
  });
});
