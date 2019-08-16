const { String } = require('../../types');
const getFirstName = require('./mutations/getFirstName');
const user = require('./sources/user');
const users = require('./sources/users');
const userSchema = require('./user');

const test = {
  graphql: {
    name: 'MyTestType',
  },
  michael: {
    type: String,
    required: true,
  },
  brielle: String,
  robert: {
    graphql: {
      args: {
        foo: [String],
        test: {
          type: String,
          description: 'This is the test input',
          defaultValue: 'testDefaultValue',
        },
        nested: [
          {
            graphql: {
              name: 'dadArgs',
              description: 'This is a description',
            },
            michael: {
              type: String,
              description: 'This is the test input for michael',
              defaultValue: 'my name is michael',
            },
          },
        ],
      },
      name: 'dad',
      description: 'This is my father',
    },
    itworks: String,
    theresa: {
      type: String,
      graphql: {
        deprecationReason: 'She old',
      },
    },
  },
};

module.exports = {
  name: 'testQuery',
  description: 'This is my test description',
  args: {
    foo: String,
    test: {
      type: String,
      description: 'This is the test input',
      defaultValue: 'onParentComponent',
    },
    id: String,
  },
  schema: {
    foo: String,
    lol: [String],
    bar: {
      type: String,
      required: true,
    },
    test: [test],
    mom: test,
    nestedNoName: {
      hasObject: String,
      double: {
        isDouble: String,
      },
    },
    firstName: {
      type: String,
      source: user,
      schema: {
        employee_name: String,
      },
    },
    employees: {
      source: users,
      schema: [userSchema],
    },
  },
  mutation: {
    getFirstName,
  },
};
