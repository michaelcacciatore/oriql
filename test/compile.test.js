const compile = require('../compile');

const schema = require('./schema/schema');

describe('Compiler', () => {
  it('should compile correctly', async () => {
    const compiled = await compile([schema]);

    expect(compiled).toMatchSnapshot();
  });
});
