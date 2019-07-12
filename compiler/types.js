const { sep } = require('path');

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
} = require(`${process.cwd()}${sep}node_modules${sep}graphql`);

const {
  GRAPHQL_OPTIONS_KEY,
} = require('../constants');

const createInputType = (type, fields) => {
  const {
    [GRAPHQL_OPTIONS_KEY]: graphQLOptions = {},
  } = type;

  return new GraphQLInputObjectType({
    fields,
    ...graphQLOptions
  })
};

const createOutputType = (type, fields) => {
  const {
    [GRAPHQL_OPTIONS_KEY]: graphQLOptions = {},
  } = type;

  return new GraphQLObjectType({
    fields,
    ...graphQLOptions
  })
};

module.exports = {
  createInputType,
  createOutputType,
};
