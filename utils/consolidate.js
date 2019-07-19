const { ROOT_OPTIONS_KEY } = require('../constants');
const getAll = require('./getAll');
const getRoot = require('./getRoot');
const getNumberOfQueries = require('./getNumberOfQueries');
const hasRoot = require('./hasRoot');

const getCurrentSchema = (potentialSchema = {}) =>
  Array.isArray(potentialSchema) ? potentialSchema[0] : potentialSchema;

const getKeysFromSchema = (potentialSchema = {}) => Object.keys(getCurrentSchema(potentialSchema));

const consolidate = (response, schema, returnSingleValue = true) => {
  const destruct = (obj, currentSchema, ...keys) =>
    Array.isArray(obj)
      ? obj.map(node => destruct(node, currentSchema, ...keys))
      : keys.reduce((final, key) => {
          const value = obj[key];
          if (typeof value === 'object') {
            if (!Array.isArray(value)) {
              /**
               * If value is an object
               */
              return {
                ...final,
                [key]: destruct(
                  value,
                  getCurrentSchema(currentSchema[key]),
                  ...getKeysFromSchema(currentSchema[key]),
                ),
              };
            }

            /**
             * If value is an array of strings
             * Note: We assume all values of the array have same schema. Hence why we only check first index
             */
            if (typeof value[0] !== 'object') {
              return {
                ...final,
                [key]: value,
                ...(currentSchema[ROOT_OPTIONS_KEY] && { [ROOT_OPTIONS_KEY]: true }),
              };
            }

            /**
             * If value is an array of objects (or 2d Array)
             */
            return {
              ...final,
              [key]: value.map(field =>
                destruct(
                  field,
                  getCurrentSchema(currentSchema[key]),
                  ...getKeysFromSchema(currentSchema[key]),
                ),
              ),
            };
          }

          /**
           * If value is a primitive
           */
          return {
            ...final,
            [key]: obj[key],
            ...(currentSchema[ROOT_OPTIONS_KEY] && { [ROOT_OPTIONS_KEY]: true }),
          };
        }, {});

  const result = destruct(response, getCurrentSchema(schema), ...getKeysFromSchema(schema));

  if (!returnSingleValue) {
    return result;
  }

  const numofResults = getNumberOfQueries(schema);
  const schemaHasRoot = hasRoot(schema);

  if (schemaHasRoot) {
    return getRoot(result);
  }

  if (numofResults.length > 1) {
    return result;
  }
  return getAll(result, numofResults[0]);
};

module.exports = consolidate;
