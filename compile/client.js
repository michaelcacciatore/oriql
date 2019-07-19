const { sep } = require('path');
const { GRAPHQL_OPTIONS_KEY, ROOT_OPTIONS_KEY } = require('../constants');
const { isNestedObject, isSource, getOutputType } = require('./helpers');
const getNumberOfQueries = require('../utils/getNumberOfQueries');

const compiledMutationsCache = new Map();

const createArgumentQuery = schema => {
  const args = isSource(schema)
    ? schema.source.args
    : (schema.graphql && schema.graphql.args) || schema.args;
  if (args) {
    const argumentConfig = Object.keys(args).reduce((query, arg) => {
      const { type = arg } = arg;
      return `${query}${query.length !== 1 ? ' ' : ''}${arg}: $${type},`;
    }, '(');

    return `${argumentConfig.substr(0, argumentConfig.length - 1)})`;
  }

  return '';
};

const compileClientQuery = schema => {
  const start = Object.keys(schema).reduce((client, key) => {
    const currentField = Array.isArray(schema[key]) ? schema[key][0] : schema[key];
    const { type } = getOutputType(currentField);
    const args = createArgumentQuery(currentField);
    if (type) {
      return `${client} ${key}${args}`;
    }
    if (isSource(currentField)) {
      const schemaValue = Array.isArray(currentField.schema)
        ? currentField.schema[0]
        : currentField.schema;
      const numberOfQueries = getNumberOfQueries(schemaValue);

      if (numberOfQueries === 1) {
        return `${client} ${key}${args}`;
      }

      return `${client} ${key}${args} ${compileClientQuery(schemaValue)}`;
    }
    if (isNestedObject(currentField) && key !== GRAPHQL_OPTIONS_KEY) {
      return `${client} ${key}${args} ${compileClientQuery(
        Array.isArray(currentField) ? currentField[0] : currentField,
      )}`;
    }
    if (key !== GRAPHQL_OPTIONS_KEY && key !== ROOT_OPTIONS_KEY) {
      console.warn(`Could not determine the GraphQL type of ${key}`);
    }

    return client;
  }, '{');

  return `${start} }`;
};

const compileClientMutation = (mutations = {}) => {
  const compile = mutation => {
    const { args, name, schema } = mutation;

    const fakedQuery = {
      [name]: {
        schema,
        source: {
          resolver: () => {}, // needed for isSoure() === true
          args,
        },
      },
    };

    const compiledMutation = compileClientQuery(fakedQuery);

    const formattedMutation = compiledMutation.slice(2, compiledMutation.length - 2);

    compiledMutationsCache.set(mutation, formattedMutation);

    return formattedMutation;
  };

  return Object.keys(mutations).reduce((allMutations, mutation) => {
    const { name } = mutations[mutation];
    if (compiledMutationsCache.has(mutations[mutation])) {
      return {
        ...allMutations,
        [name]: compiledMutationsCache.get(mutations[mutation]),
      };
    }

    return {
      ...allMutations,
      [name]: compile(mutations[mutation]),
    };
  }, {});
};

const compileClient = schemaFiles => {
  return schemaFiles.reduce((client, file) => {
    const schemaContents = require(`${process.cwd()}${sep}${file}`); // eslint-disable-line global-require
    const { args, name, schema, mutation } = schemaContents;

    const compiledMutations = compileClientMutation(mutation);

    return {
      ...client,
      [name]: `${name}${createArgumentQuery({ args })} ${compileClientQuery(schema, args)}`,
      mutations: {
        ...(client.mutations || {}),
        [name]: compiledMutations,
      },
    };
  }, {});
};

module.exports = compileClient;
