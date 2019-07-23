const { GRAPHQL_PATH } = require('../constants');

const {
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
} = require(GRAPHQL_PATH);

module.exports = {
  String: GraphQLString,
  Float: GraphQLFloat,
  Boolean: GraphQLBoolean,
  Number: GraphQLInt,
  ID: GraphQLID,
  Integer: GraphQLInt,
};
