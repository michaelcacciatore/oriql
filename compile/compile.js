const { promisify } = require('util');
const { sep } = require('path');
const glob = require('glob');
const { GRAPHQL_OPTIONS_KEY, GRAPHQL_PATH, resolve } = require('../constants');

const { GraphQLNonNull, GraphQLList, GraphQLSchema, isOutputType } = require(GRAPHQL_PATH);

const createArgumentConfig = require('./arguments');
const compileClient = require('./client');
const { isGraphQLOutputType, isNestedObject, isSource } = require('./helpers');
const { createOutputType, generateOutputType } = require('./types');
const consolidate = require('../utils/consolidate');
const hasRoot = require('../utils/hasRoot');
const getNumberOfQueries = require('../utils/getNumberOfQueries');

const findFiles = promisify(glob);

const compileSchema = async (filePattern = '!(node_modules)/**/schema.js') => {
  try {
    const schemaFiles = await findFiles(filePattern);
    const { query, mutation } = schemaFiles.reduce((fullSchema, file) => {
      const {
        args: parentArgs = {},
        description,
        deprecationReason,
        name,
        schema: schemaContent = {},
        mutation: schemaMutation = {},
      } = require(`${process.cwd()}${sep}${file}`); // eslint-disable-line global-require

      const compile = (schema, previousName, includeResolver = false) =>
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
                resolve: !includeResolver ? () => key : undefined,
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
                resolve: resolver
                  ? async (...args) => {
                      const resolved = await resolver(...args);
                      return consolidate(resolved, requestedSchema);
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
                    resolve: resolver
                      ? async (...arg) => {
                          const resolved = await resolver(...arg);
                          return consolidate(resolved, requestedSchema);
                        }
                      : () => key,
                  },
                };
              }
            }
            // Create the type or find it from the types already created
            const type = generateOutputType({
              graphql,
              fields: () => compile(schemaToCompile, typeName, isSchemaASource),
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
                resolve: resolver
                  ? async (...arg) => {
                      const resolved = await resolver(...arg);
                      return consolidate(resolved, requestedSchema);
                    }
                  : () => key,
              },
            };
          }

          return final;
        }, {});

      const graphql = {
        description,
        deprecationReason,
        name,
      };

      return {
        ...fullSchema,
        query: {
          ...fullSchema.query,
          [name]: {
            resolve,
            args: createArgumentConfig(parentArgs, name),
            type: generateOutputType({
              name,
              graphql,
              schema: schemaContent,
              fields: () => compile(schemaContent),
            }),
          },
        },
        mutation: {
          ...fullSchema.mutation,
          ...Object.entries(schemaMutation).reduce(
            (mutations, [key, { args, resolver, schema, ...graphqlSettings }]) => ({
              ...mutations,
              [key]: {
                resolve: resolver
                  ? async (...arg) => {
                      const resolved = await resolver(...arg);
                      return consolidate(resolved, schema);
                    }
                  : () => key,
                args: createArgumentConfig(args),
                type: generateOutputType({
                  schema,
                  name: key,
                  graphql: graphqlSettings,
                  fields: () => compile(schema, graphqlSettings.name, true),
                }),
              },
            }),
            {},
          ),
        },
      };
    }, {});

    const server = new GraphQLSchema({
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

    const client = compileClient(schemaFiles);

    return {
      client,
      server,
    };
  } catch (e) {
    console.error(e);
    throw new Error('An unexpected error during schema compilation');
  }
};

module.exports = compileSchema;
