const { ROOT_OPTIONS_KEY } = require('../constants');

const isRoot = (key, value) => key === ROOT_OPTIONS_KEY && value === true;

module.exports = isRoot;
