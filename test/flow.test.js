const compileFlow = require('../compile/flow');
const compileTypescript = require('../compile/typescript');

const schema = require('./schema/schema');

describe('Flow', () => {
  it('should compile correctly', () => {
    const compiled = compileFlow(compileTypescript([schema]));

    expect(compiled).toMatchSnapshot();
  });
});
