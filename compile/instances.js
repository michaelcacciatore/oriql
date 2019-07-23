const instanceNames = new Set();

const generateInstanceMap = (instances = [], name) =>
  instances.reduce(
    (map, instance) => {
      if (instanceNames.has(instance)) {
        throw new Error(
          `A duplicate instance name for "${instance}" already exists. Please use a new name.`,
        );
      }
      instanceNames.add(instance);

      return {
        ...map,
        [instance]: name,
      };
    },
    { [name]: name },
  );

module.exports = generateInstanceMap;
