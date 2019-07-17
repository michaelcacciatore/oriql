const { sep } = require('path');
const { GRAPHQL_OPTIONS_KEY, ROOT_OPTIONS_KEY } = require('../constants');
const { isNestedObject, isSource, getOutputType } = require('./helpers');
const getNumberOfQueries = require('../utils/getNumberOfQueries');

const createArgumentQuery = schema => {
  const args = isSource(schema) ? schema.source.args : schema.args;
  if (args) {
    const argumentConfig = Object.keys(args).reduce((query, arg) => {
      return `${query}${query.length !== 1 ? ' ' : ''}${arg}: $${arg},`;
    }, '(');

    return `${argumentConfig.substr(0, argumentConfig.length - 1)})`;
  }

  return '';
};

const compileSchema = schema => {
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

      return `${client} ${key}${args} ${compileSchema(schemaValue)}`;
    }
    if (isNestedObject(currentField) && key !== GRAPHQL_OPTIONS_KEY) {
      return `${client} ${key}${args} ${compileSchema(
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

const compileClient = schemaFiles => {
  return schemaFiles.reduce((client, file) => {
    const schemaContents = require(`${process.cwd()}${sep}${file}`); // eslint-disable-line global-require
    const { name, schema } = schemaContents;

    return {
      ...client,
      [name]: `${name} ${compileSchema(schema)}`,
    };
  }, {});
};

module.exports = compileClient;
