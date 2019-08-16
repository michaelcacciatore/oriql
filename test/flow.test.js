const compileFlow = require('../compile/flow');
const compileTypescript = require('../compile/typescript');

const schema = require('./schema/schema');

const correctOutput = `export interface PropTypes$testQuery {
  foo?: string | null | void;
  lol?: Array<string> | null | void;
  bar?: string;
  test: Array<{
    michael?: string,
    brielle?: string | null | void,
    robert: {
      itworks?: string | null | void,
      theresa?: string | null | void,
      ...
    } | null | void,
    ...
  }> | null | void;
  mom: {
    michael?: string,
    brielle?: string | null | void,
    robert: {
      itworks?: string | null | void,
      theresa?: string | null | void,
      ...
    } | null | void,
    ...
  } | null | void;
  nestedNoName: {
    hasObject?: string | null | void,
    double: {
      isDouble?: string | null | void,
      ...
    } | null | void,
    ...
  } | null | void;
  firstName?: string | null | void;
  employees: Array<{
    id?: string | null | void,
    employee_name?: string | null | void,
    employee_salary?: string | null | void,
    employee_age?: string | null | void,
    profile_image?: string | null | void,
    ...
  }> | null | void;
}
`;

describe('Flow', () => {
  it('should compile correctly', () => {
    const compiled = compileFlow(compileTypescript([schema]));

    expect(compiled).toBe(correctOutput);
  });
});
