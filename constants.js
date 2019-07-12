const { sep } = require('path');

/**
 * Default resolver for nested objects;
 */
const resolve = () => ({});

const GRAPHQL_PATH =
  process.env.NODE_ENV === 'oriql' ? `${process.cwd()}${sep}node_modules${sep}graphql` : 'graphql';

const GRAPHQL_OPTIONS_KEY = 'graphql';
const ROOT_OPTIONS_KEY = 'root';

module.exports = {
  GRAPHQL_OPTIONS_KEY,
  GRAPHQL_PATH,
  ROOT_OPTIONS_KEY,
  resolve,
};
