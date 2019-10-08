const { GRAPHQL_PATH } = require('../constants');
const { consolidate } = require('../utils/consolidate');

const { isOutputType, isInputType } = require(GRAPHQL_PATH);

const isNestedObject = obj =>
  !Array.isArray(obj) &&
  typeof obj === 'object' &&
  !(typeof obj.type !== 'undefined' || typeof obj.extends !== 'undefined');

const isGraphQLOutputType = obj =>
  !Array.isArray(obj) &&
  typeof obj === 'object' &&
  isOutputType(Array.isArray(obj.type) ? obj.type[0] : obj.type);

const isGraphQLInputType = obj =>
  !Array.isArray(obj) &&
  typeof obj === 'object' &&
  isInputType(Array.isArray(obj.type) ? obj.type[0] : obj.type);

const isSource = obj =>
  !Array.isArray(obj) &&
  typeof obj === 'object' &&
  typeof obj.source === 'object' &&
  typeof obj.source.resolver === 'function';

const getOutputType = obj => {
  const type = Array.isArray(obj) ? obj[0] : obj;
  const isGraphQLOutput = isGraphQLOutputType(type);
  if (isGraphQLOutput) {
    return {
      type: Array.isArray(obj.type) ? obj.type[0] : obj.type,
    };
  }
  const isOutput = isOutputType(type);
  if (isOutput) {
    return {
      type,
    };
  }

  return {};
};

const defaultResolverFunction = (root, _, extensions, { path: { key: fieldKey } }) => fieldKey;

const executeResolver = (resolver, schema) => async (...args) =>
  consolidate(await resolver(...args), schema);

module.exports = {
  defaultResolverFunction,
  executeResolver,
  isNestedObject,
  isGraphQLOutputType,
  isGraphQLInputType,
  isSource,
  getOutputType,
};
