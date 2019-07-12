/**
 * Default resolver for nested objects;
 */
const resolve = () => ({});

const GRAPHQL_OPTIONS_KEY = 'graphql';
const ROOT_OPTIONS_KEY = 'root';

module.exports = {
  GRAPHQL_OPTIONS_KEY,
  ROOT_OPTIONS_KEY,
  resolve,
};
