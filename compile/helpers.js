const { GRAPHQL_PATH } = require('../constants');

const { isOutputType, isInputType } = require(GRAPHQL_PATH);

const isNestedObject = obj =>
  !Array.isArray(obj) &&
  typeof obj === 'object' &&
  (typeof obj.type === 'undefined' || typeof obj.extends === 'undefined');

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
      type: obj.type,
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

module.exports = {
  isNestedObject,
  isGraphQLOutputType,
  isGraphQLInputType,
  isSource,
  getOutputType,
};
