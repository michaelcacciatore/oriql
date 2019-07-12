const getAll = (obj, keyToGet) => {
  const keys = keyToGet.split('.');
  const get = (value, keyIndex) => {
    return Object.keys(value).reduce((next, field) => {
      if (keys[keyIndex] !== field) {
        return next;
      }
      if (typeof value[field] === 'object') {
        if (keyIndex === keys.length - 1) {
          return value[field];
        }

        if (Array.isArray(value[field])) {
          return value[field].map(prop => get(prop, keyIndex + 1));
        }

        return get(value[field], keyIndex + 1)
      }

      if (keyIndex === keys.length - 1) {
        return value[field];
      }
    }, {});
  }

  if (Array.isArray(obj)) {
    return obj.map(field => get(field, 0));
  }

  return get(obj, 0);
};


module.exports = getAll;
