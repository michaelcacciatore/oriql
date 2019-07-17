const isRoot = require('./isRoot');

const getRoot = obj => {
  const findRoot = value => {
    const keys = Object.keys(value);

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const property = value[key];
      if (typeof property === 'object') {
        if (Array.isArray(property)) {
          return property.map(field => findRoot(field));
        }

        return findRoot(property);
      }

      if (isRoot(key, property)) {
        const { root, ...values } = value;

        return values;
      }
    }

    return value;
  };

  return findRoot(obj);
};

module.exports = getRoot;
