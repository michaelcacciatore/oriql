const { format } = require('prettier');
const { GRAPHQL_OPTIONS_KEY, GRAPHQL_PATH, ROOT_OPTIONS_KEY } = require('../constants');

const {
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
} = require(GRAPHQL_PATH);
const { isNestedObject, isSource, getOutputType } = require('./helpers');
const getNumberOfQueries = require('../utils/getNumberOfQueries');

const graphQLToTypescriptMap = {
  [GraphQLString]: 'string',
  [GraphQLBoolean]: 'boolean',
  [GraphQLFloat]: 'number',
  [GraphQLInt]: 'number',
  [GraphQLID]: 'string',
};

const createTypeIfArray = (type, isArray) => (isArray ? `Array<${type}>` : type);

const compileTypescriptInterface = (schema, isTopLevel = false) => {
  const start = Object.keys(schema).reduce(
    (client, key) => {
      const isArray = Array.isArray(schema[key]);
      const currentField = isArray ? schema[key][0] : schema[key];
      const { type: graphQLType } = getOutputType(currentField);
      const type = createTypeIfArray(graphQLToTypescriptMap[graphQLType], isArray);
      const isRequired = typeof currentField === 'object' && currentField.required;
      const ifRequiredType = !isRequired ? ' | null | undefined' : '';
      if (graphQLType) {
        return `${client}${key}?: ${type}${ifRequiredType};`;
      }
      if (isSource(currentField)) {
        const isSourceAnArray = Array.isArray(currentField.schema);
        const schemaValue = isSourceAnArray ? currentField.schema[0] : currentField.schema;
        const numberOfQueries = getNumberOfQueries(schemaValue);

        if (numberOfQueries === 1) {
          return `${client}${key}?: ${createTypeIfArray(
            type,
            isSourceAnArray || isArray,
          )}${ifRequiredType};`;
        }

        return `${client}${key}: ${createTypeIfArray(
          compileTypescriptInterface(schemaValue),
          isSourceAnArray || isArray,
        )}${ifRequiredType};`;
      }
      if (isNestedObject(currentField) && key !== GRAPHQL_OPTIONS_KEY) {
        const isNestedObjectAnArray = Array.isArray(currentField);
        return `${client}${key}: ${createTypeIfArray(
          compileTypescriptInterface(isNestedObjectAnArray ? currentField[0] : currentField, false),
          isNestedObjectAnArray || isArray,
        )}${ifRequiredType};`;
      }
      if (key !== GRAPHQL_OPTIONS_KEY && key !== ROOT_OPTIONS_KEY) {
        console.warn(`Could not determine the GraphQL type of ${key}`);
      }

      return client;
    },
    isTopLevel ? '' : '{',
  );

  return `${start} ${isTopLevel ? '' : '}'}`;
};

const compileTypescriptDefinitions = schemaFiles => {
  const interfacesToExtend = {};
  const baseInterfaces = schemaFiles.reduce((client, file) => {
    const { instances = [], name, schema: rawSchema } = file;

    interfacesToExtend[name] = instances;

    return `${client} export interface ${name} { ${compileTypescriptInterface(rawSchema, true)}}`;
  }, 'export namespace PropTypes {');

  const extendedInterfaces = Object.keys(interfacesToExtend).reduce((extended, name) => {
    return `${extended} ${interfacesToExtend[name].reduce(
      (interfaces, instance) => `${interfaces}export interface ${instance} extends ${name} {}`,
      '',
    )}`;
  }, '');

  return format(`${baseInterfaces}${extendedInterfaces}}`, { parser: 'typescript' });
};

module.exports = compileTypescriptDefinitions;
