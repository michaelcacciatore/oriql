const { GRAPHQL_PATH } = require('../constants');

const { isOutputType } = require(GRAPHQL_PATH);
const findPredicates = require('./findPredicates');

const getNumberOfQueries = (schema, returnValue = false) =>
  findPredicates(
    schema,
    value => isOutputType(value) || (Array.isArray(value) && isOutputType(value[0])),
    returnValue,
  );

module.exports = getNumberOfQueries;
