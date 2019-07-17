const findPredicates = (obj, predicate, returnValue = false, existingPath = '') => {
  let levels = 0;
  const find = (object, key) => {
    levels += 1;
    const newPath = existingPath ? `${existingPath}.${key}` : key;
    const value = object[key];
    if (predicate(value, key)) {
      return returnValue ? value : newPath;
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          return value
            .map(field => findPredicates(field, predicate, returnValue, newPath))
            .flat(levels);
        }

        return value.map(field => find(field));
      }
      return findPredicates(value, predicate, returnValue, newPath);
    }
    return undefined;
  };

  return Object.keys(obj)
    .map(key => find(obj, key))
    .filter(field => !!field)
    .flat(levels);
};

module.exports = findPredicates;
