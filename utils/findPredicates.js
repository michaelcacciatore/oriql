const findPredicates = (obj, predicate, existingPath = '') => {
  let levels = 0;
  const find = (object, key) => {
    levels += 1;
    const newPath = existingPath ? `${existingPath}.${key}` : key;
    const value = object[key];
    if (predicate(value, key)) {
      return newPath;
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          return value.map(field => findPredicates(field, predicate, newPath)).flat(levels);
        }

        return value.map(field => find(field));
      }
      return findPredicates(value, predicate, newPath);
    }
  };

  return Object.keys(obj).map(key => find(obj, key)).filter(field => !!field).flat(levels);
};

module.exports = findPredicates;
