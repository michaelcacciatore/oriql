const { promisify } = require('util');
const { sep } = require('path');
const glob = require('glob');
const { GRAPHQL_PATH } = require('../constants');

const { GraphQLSchema } = require(GRAPHQL_PATH);

const compileClient = require('./client');
const compile = require('./compile');
const { defaultResolverFunction } = require('./helpers');
const compileFlowDefinitions = require('./flow');
const { createOutputType } = require('./types');
const compileTypescriptDefinitions = require('./typescript');

const findFiles = promisify(glob);

const compileSchema = async config => {
  const {
    client = false,
    defaultResolver = defaultResolverFunction,
    pattern = '!(node_modules)/**/schema.js',
    schema,
    server = false,
    typescript = false,
    flow = false,
  } = config;
  try {
    const schemaFiles = (schema || (await findFiles(pattern))).map(
      file => (schema ? file : require(`${process.cwd()}${sep}${file}`)), // eslint-disable-line global-require
    );
    const { query, mutation } = compile(schemaFiles, defaultResolver);

    const serverSchema =
      server || (!server && !client)
        ? new GraphQLSchema({
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
          })
        : undefined;

    const clientSchema = client || (!server && !client) ? compileClient(schemaFiles) : undefined;

    const typeScriptDefinitions =
      typescript || flow ? compileTypescriptDefinitions(schemaFiles) : undefined;

    const flowDefinitions = flow ? compileFlowDefinitions(typeScriptDefinitions) : undefined;

    return {
      client: clientSchema,
      server: serverSchema,
      typescript: typeScriptDefinitions,
      flow: flowDefinitions,
    };
  } catch (e) {
    console.error(e);
    throw new Error('An unexpected error during schema compilation');
  }
};

module.exports = (config = {}) => compileSchema(config);
