const { resolve } = require('../constants');

const createArgumentConfig = require('./arguments');
const { executeResolver } = require('./helpers');
const compileFields = require('./fields');
const { generateOutputType } = require('./types');

/**
 * Takes all the schema files and compiles both the queries and mutations
 * @param {Object[]} schemaFiles The schema files to compile
 * @param {function} defaultResolver The default resolver to use if none is provided in the field
 */
const compile = (schemaFiles, defaultResolver) =>
  schemaFiles.reduce((fullSchema, file) => {
    const {
      args: parentArgs = {},
      description,
      deprecationReason,
      name,
      schema: schemaContent = {},
      mutation: schemaMutation = {},
    } = file;

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
            fields: () => compileFields(schemaContent, name, true, defaultResolver),
          }),
        },
      },
      mutation: {
        ...fullSchema.mutation,
        ...Object.entries(schemaMutation).reduce(
          (mutations, [key, { args, resolver, schema: mutationSchema, ...graphqlSettings }]) => ({
            ...mutations,
            [key]: {
              resolve: resolver ? executeResolver(resolver, mutationSchema) : defaultResolver,
              args: createArgumentConfig(args),
              type: generateOutputType({
                schema: mutationSchema,
                name: key,
                graphql: graphqlSettings,
                fields: () =>
                  compileFields(mutationSchema, graphqlSettings.name, true, defaultResolver),
              }),
            },
          }),
          {},
        ),
      },
    };
  }, {});

module.exports = compile;
