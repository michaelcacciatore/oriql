const { sep } = require('path');
const {
  GraphQLList,
  isInputType,
} = require(`${process.cwd()}${sep}node_modules${sep}graphql`);

const {
  GRAPHQL_OPTIONS_KEY,
} = require('../constants');
const {
  isNestedObject,
  isGraphQLInputType,
} = require('./helpers');
const {
  createInputType,
} = require('./types');

const nestedInputTypes = new Map();
const inputTypeNames = new Set();

const createArgumentConfig = (args = {}, name) => {
  const createArgument = (args, previousName) => (
    Object.entries(args).reduce((config, [key, arg]) => {
      const isArray = Array.isArray(arg);
      const value = isArray ? arg[0] : arg;
      if (isInputType(value)) {
        return {
          ...config,
          [key]: {
            type: isArray ? GraphQLList(value) : value,
          }
        };
      } else if (isGraphQLInputType(value)) {
        const isTypeAnArray = Array.isArray(value.type);
        return {
          ...config,
          [key]: {
            ...value,
            type: isArray || isTypeAnArray ? GraphQLList(isTypeAnArray ? value.type[0] : value.type) : value.type,
          }
        }
      } else if (isNestedObject(value) && key !== GRAPHQL_OPTIONS_KEY) {
        const {
          graphql: {
            description,
            defaultValue,
            name: typeName = (previousName || name) ? `${previousName || name}_${key}_args` : key,
          } = {}
        } = value;

        const graphql = {
          graphql: {
            name: typeName,
          },
        };

        const createdArguments = createArgument(value, undefined, name);
        const type = (() => {
          if (nestedInputTypes.has(value)) {
            return nestedInputTypes.get(value);
          }

          if (inputTypeNames.has(typeName)) {
            throw new Error(`A duplicate name already exists for ${typeName}.  Please create a new name or reference the same schema`)
          }

          inputTypeNames.add(typeName);

          const type = createInputType({ ...graphql, ...value }, createdArguments);

          nestedInputTypes.set(value, type);

          return type;

        })();

        return {
          ...config,
          [key]: { defaultValue, description, type: isArray ? GraphQLList(type) : type }
        }
      }
    }, {})
  );

  return createArgument(args);
};

module.exports = createArgumentConfig;
