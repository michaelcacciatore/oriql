const { GRAPHQL_OPTIONS_KEY, GRAPHQL_PATH } = require('../constants');

const { GraphQLList, isInputType } = require(GRAPHQL_PATH);
const { isNestedObject, isGraphQLInputType } = require('./helpers');
const { createInputType } = require('./types');

const nestedInputTypes = new Map();
const inputTypeNames = new Set();

const createArgumentConfig = (args = {}, name) => {
  const createArgument = (providedArgs, previousName) =>
    Object.entries(providedArgs).reduce((config, [key, arg]) => {
      const isArray = Array.isArray(arg);
      const value = isArray ? arg[0] : arg;
      if (isInputType(value)) {
        return {
          ...config,
          [key]: {
            type: isArray ? GraphQLList(value) : value,
          },
        };
      }
      if (isGraphQLInputType(value)) {
        const isTypeAnArray = Array.isArray(value.type);
        return {
          ...config,
          [key]: {
            ...value,
            type:
              isArray || isTypeAnArray
                ? GraphQLList(isTypeAnArray ? value.type[0] : value.type)
                : value.type,
          },
        };
      }
      if (isNestedObject(value) && key !== GRAPHQL_OPTIONS_KEY) {
        const {
          graphql: {
            description,
            defaultValue,
            name: typeName = previousName || name ? `${previousName || name}_${key}_args` : key,
          } = {},
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
            throw new Error(
              `A duplicate name already exists for ${typeName}.  Please create a new name or reference the same schema`,
            );
          }

          inputTypeNames.add(typeName);

          const inputType = createInputType({ ...graphql, ...value }, createdArguments);

          nestedInputTypes.set(value, inputType);

          return inputType;
        })();

        return {
          ...config,
          [key]: { defaultValue, description, type: isArray ? GraphQLList(type) : type },
        };
      }

      return config;
    }, {});

  return createArgument(args);
};

module.exports = createArgumentConfig;
