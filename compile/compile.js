const { promisify } = require('util');
const { sep } = require('path');
const glob = require('glob');
const { GRAPHQL_OPTIONS_KEY, GRAPHQL_PATH, resolve } = require('../constants');

const { GraphQLNonNull, GraphQLList, GraphQLSchema, isOutputType } = require(GRAPHQL_PATH);

const createArgumentConfig = require('./arguments');
const { isGraphQLOutputType, isNestedObject } = require('./helpers');
const { createOutputType } = require('./types');

const findFiles = promisify(glob);

const compileSchema = async (filePattern = '!(node_modules)/**/schema.js') => {
  try {
    const schemaFiles = await findFiles(filePattern);
    const nestedTypes = new Map();
    const typeNames = new Set();
    const { query, mutation } = schemaFiles.reduce((fullSchema, file) => {
      const {
        args: parentArgs = {},
        description,
        deprecationReason,
        name,
        schema: schemaContent = {},
        mutation: schemaMutation = {},
      } = require(`${process.cwd()}${sep}${file}`); // eslint-disable-line global-require

      const compile = (schema, previousName) =>
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
                resolve: () => key,
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
              // schema: requestedSchema,
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
                return GraphQLNonNull(type);
              }

              if (isArray || isTypeAnArray) {
                return GraphQLList(typeValue);
              }

              return type;
            })();

            return {
              ...final,
              [key]: {
                args: sourceArgs ? createArgumentConfig(sourceArgs) : undefined,
                type: actualType,
                resolve: resolver
                  ? async (...args) => {
                      const resolved = await resolver(...args);
                      return resolved;
                    }
                  : () => key,
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
              graphql: {
                args,
                name: typeName = previousName || name ? `${previousName || name}_${key}` : key,
              } = {},
            } = schemaValue;

            const graphql = {
              graphql: {
                name: typeName,
              },
            };

            // recursively create the fields for this object
            const fields = compile(schemaValue, typeName);
            // Create the type or find it from the types already created
            const type = (() => {
              if (nestedTypes.has(schemaValue)) {
                return nestedTypes.get(schemaValue);
              }

              if (typeNames.has(typeName)) {
                throw new Error(
                  `A duplicate name already exists for ${typeName}.  Please create a new name or reference the same schema`,
                );
              }

              typeNames.add(typeName);

              const outputType = createOutputType({ ...graphql, ...schemaValue }, fields);

              nestedTypes.set(schemaValue, outputType);

              return outputType;
            })();

            return {
              ...final,
              [key]: {
                args: createArgumentConfig(args, typeName),
                type: isArray ? GraphQLList(type) : type,
                resolve: () => key,
              },
            };
          }

          return final;
        }, {});

      const graphql = { description, deprecationReason, name };

      return {
        ...fullSchema,
        query: {
          ...fullSchema.query,
          [name]: {
            resolve,
            args: createArgumentConfig(parentArgs, name),
            type: createOutputType({ graphql }, compile(schemaContent)),
          },
        },
        mutation: {
          ...fullSchema.mutation,
          ...Object.entries(schemaMutation).reduce(
            (mutations, [key, { args, schema, ...graphqlSettings }]) => ({
              ...mutations,
              [key]: {
                resolve,
                args: createArgumentConfig(args),
                type: createOutputType({ graphql: graphqlSettings }, compile(schema)),
              },
            }),
            {},
          ),
        },
      };
    }, {});

    return new GraphQLSchema({
      ...(Object.keys(query).length && {
        query: createOutputType(
          {
            graphql: {
              name: 'RootQueryType',
            },
          },
          query,
        ),
      }),
      ...(Object.keys(mutation).length && {
        mutation: createOutputType(
          {
            graphql: {
              name: 'RootMutationType',
            },
          },
          mutation,
        ),
      }),
    });
  } catch (e) {
    console.error(e);
    throw new Error('An unexpected error during schema compilation');
  }
};

module.exports = compileSchema;
