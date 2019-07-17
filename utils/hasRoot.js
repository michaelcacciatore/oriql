const findPredicates = require('./findPredicates');
const isRoot = require('./isRoot');

const hasRoot = schema => findPredicates(schema, (value, key) => isRoot(key, value)).length === 1;

module.exports = hasRoot;
