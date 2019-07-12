const { GRAPHQL_PATH, GRAPHQL_OPTIONS_KEY } = require('../constants');

const { GraphQLObjectType, GraphQLInputObjectType } = require(GRAPHQL_PATH);

const createInputType = (type, fields) => {
  const { [GRAPHQL_OPTIONS_KEY]: graphQLOptions = {} } = type;

  return new GraphQLInputObjectType({
    fields,
    ...graphQLOptions,
  });
};

const createOutputType = (type, fields) => {
  const { [GRAPHQL_OPTIONS_KEY]: graphQLOptions = {} } = type;

  return new GraphQLObjectType({
    fields,
    ...graphQLOptions,
  });
};

module.exports = {
  createInputType,
  createOutputType,
};
