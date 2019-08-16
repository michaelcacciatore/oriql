const compileTypescript = require('../compile/typescript');

const schema = require('./schema/schema');

const correctOutput = `export namespace PropTypes {
  export interface testQuery {
    foo?: string | null | undefined;
    lol?: Array<string> | null | undefined;
    bar?: string;
    test:
      | Array<{
          michael?: string;
          brielle?: string | null | undefined;
          robert:
            | {
                itworks?: string | null | undefined;
                theresa?: string | null | undefined;
              }
            | null
            | undefined;
        }>
      | null
      | undefined;
    mom:
      | {
          michael?: string;
          brielle?: string | null | undefined;
          robert:
            | {
                itworks?: string | null | undefined;
                theresa?: string | null | undefined;
              }
            | null
            | undefined;
        }
      | null
      | undefined;
    nestedNoName:
      | {
          hasObject?: string | null | undefined;
          double: { isDouble?: string | null | undefined } | null | undefined;
        }
      | null
      | undefined;
    firstName?: string | null | undefined;
    employees:
      | Array<{
          id?: string | null | undefined;
          employee_name?: string | null | undefined;
          employee_salary?: string | null | undefined;
          employee_age?: string | null | undefined;
          profile_image?: string | null | undefined;
        }>
      | null
      | undefined;
  }
}
`;

describe('Typescript', () => {
  it('should compile correctly', () => {
    const compiled = compileTypescript([schema]);

    expect(compiled).toBe(correctOutput);
  });
});
