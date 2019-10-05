const compileTypescript = require('../compile/typescript');

const schema = require('./schema/schema');

describe('Typescript', () => {
  it('should compile correctly', () => {
    const compiled = compileTypescript([schema]);

    expect(compiled).toMatchSnapshot();
  });
});
