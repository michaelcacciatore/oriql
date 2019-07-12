const {
  GRAPHQL_OPTIONS_KEY,
} = require('../constants');

const reservedWords = [
  'type',
  'required',
  'source',
  'extends',
  GRAPHQL_OPTIONS_KEY,
];

const reserverdKeys = reservedWords.reduce((reserved, word) => (
  {
    ...reserved,
    [`__${word}`]: word,
  }
), {});

const reservedKeysInverse = Object.entries(reserverdKeys).reduce((inverse, [key, value]) => (
  {
    ...inverse,
    [value]: key,
  }
), {});

module.exports = {
  reservedWords,
  reserverdKeys,
  reservedKeysInverse,
};
