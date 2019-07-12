const { sep } = require('path');

const {
  isOutputType,
  isInputType,
} = require(`${process.cwd()}${sep}node_modules${sep}graphql`);

const {
  ROOT_OPTIONS_KEY,
} = require('../constants');

const isNestedObject = obj => (
  !Array.isArray(obj)
  && typeof obj === 'object'
  && (typeof obj.type === 'undefined' || typeof obj.extends === 'undefined')
);

const isGraphQLOutputType = obj => (
  !Array.isArray(obj)
  && typeof obj === 'object' &&
  isOutputType(Array.isArray(obj.type) ? obj.type[0]: obj.type)
);

const isGraphQLInputType = obj => (
  !Array.isArray(obj)
  && typeof obj === 'object'
  && isInputType(Array.isArray(obj.type) ? obj.type[0]: obj.type)
);

const isRoot = (key, value) => key === ROOT_OPTIONS_KEY && value === true;

module.exports = {
  isNestedObject,
  isGraphQLOutputType,
  isGraphQLInputType,
  isRoot,
};
