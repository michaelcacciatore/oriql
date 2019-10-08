const { GRAPHQL_OPTIONS_KEY, GRAPHQL_PATH } = require('../constants');

const { GraphQLNonNull, GraphQLList, isOutputType } = require(GRAPHQL_PATH);

const createArgumentConfig = require('./arguments');
const { executeResolver, isGraphQLOutputType, isNestedObject, isSource } = require('./helpers');
const { generateOutputType } = require('./types');
const hasRoot = require('../utils/hasRoot');
const getNumberOfQueries = require('../utils/getNumberOfQueries');

/**
 * Compiles a basic GraphQL schema field
 * @param {*} compiledSchema
 * @param {string} previousName The name of the parent schema object (if applicable)
 * @param {boolean} [includeResolver=false] A boolean deciding whether or not to include the default resolver
 * @param {function} defaultResolver The default resolver function to use in the schema
 */
const compileFields = (schema, previousName, includeResolver = false, defaultResolver) =>
  Object.entries(schema).reduce((final, [key, value]) => {
    const isArray = Array.isArray(value);
    const schemaValue = isArray ? value[0] : value;
    if (isOutputType(schemaValue)) {
      /**
       * Example:
       * foo: String,
       */
      return {
        ...final,
        [key]: {
          type: isArray ? GraphQLList(schemaValue) : schemaValue,
          resolve: !includeResolver ? defaultResolver : undefined,
        },
      };
    }
    if (isGraphQLOutputType(schemaValue)) {
      /**
       * Example:
       * bar: {
       *   type: String,
       *   required?: true,
       * },
       */
      const {
        type,
        required = false,
        source: { resolver, args: sourceArgs /* schema: sourceSchema */ } = {},
        schema: requestedSchema,
        [GRAPHQL_OPTIONS_KEY]: graphql = {}, // optional ptions to be passed to graphql. ie name, description, deprecationReason
      } = schemaValue;

      /**
       * Example:
       * bar: {
       *   type: [String],
       *   required?: true,
       * },
       */
      const isTypeAnArray = Array.isArray(type);

      const typeValue = isTypeAnArray ? type[0] : type;

      const actualType = (() => {
        if (required) {
          if (isArray || isTypeAnArray) {
            return GraphQLList(GraphQLNonNull(typeValue));
          }
          return GraphQLNonNull(typeValue);
        }

        if (isArray || isTypeAnArray) {
          return GraphQLList(typeValue);
        }

        return typeValue;
      })();

      return {
        ...final,
        [key]: {
          args: sourceArgs ? createArgumentConfig(sourceArgs) : undefined,
          type: actualType,
          resolve: resolver ? executeResolver(resolver, requestedSchema) : defaultResolver,
          ...graphql,
        },
      };
    }
    if (isNestedObject(schemaValue) && key !== GRAPHQL_OPTIONS_KEY) {
      /**
       * Example:
       * test: {
       *   michael: {
       *     type: String,
       *     required: true,
       *   },
       *   brielle: String,
       * }
       */

      // generate a unique name (or the the one provided)
      const {
        graphql: { args, name: typeName = previousName ? `${previousName}_${key}` : key } = {},
        source: { resolver, args: sourceArgs = {} /* schema: sourceSchema */ } = {},
        schema: requestedSchema = {},
      } = schemaValue;

      const graphql = {
        graphql: {
          name: typeName,
        },
      };

      const isSchemaASource = isSource(schemaValue);

      const isSourceAnArray = Array.isArray(requestedSchema);

      const schemaToCompile = (() => {
        if (isSchemaASource) {
          return isSourceAnArray ? requestedSchema[0] : requestedSchema;
        }
        return schemaValue;
      })();

      if (isSchemaASource && !schemaToCompile.type) {
        const numberOfQueries = getNumberOfQueries(requestedSchema, true);
        const sourceHasRoot = hasRoot(schema);
        if (numberOfQueries.length === 1 && !sourceHasRoot) {
          return {
            ...final,
            [key]: {
              args: createArgumentConfig(
                {
                  ...sourceArgs,
                  ...args,
                },
                typeName,
              ),
              type: Array.isArray(numberOfQueries[0])
                ? GraphQLList(numberOfQueries[0])
                : numberOfQueries[0],
              resolve: resolver ? executeResolver(resolver, requestedSchema) : defaultResolver,
            },
          };
        }
      }
      // Create the type or find it from the types already created
      const type = generateOutputType({
        graphql,
        fields: () => compileFields(schemaToCompile, typeName, isSchemaASource, defaultResolver),
        name: typeName,
        schema: schemaToCompile,
      });

      return {
        ...final,
        [key]: {
          args: createArgumentConfig(
            {
              ...sourceArgs,
              ...args,
            },
            typeName,
          ),
          type: isArray || isSourceAnArray ? GraphQLList(type) : type,
          resolve: resolver ? executeResolver(resolver, requestedSchema) : defaultResolver,
        },
      };
    }

    return final;
  }, {});

module.exports = compileFields;
