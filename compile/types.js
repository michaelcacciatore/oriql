const { GRAPHQL_PATH, GRAPHQL_OPTIONS_KEY } = require('../constants');

const { GraphQLObjectType, GraphQLInputObjectType } = require(GRAPHQL_PATH);

const createInputType = (type, fields) => {
  const { [GRAPHQL_OPTIONS_KEY]: graphQLOptions = {} } = type;

  return new GraphQLInputObjectType({
    fields,
    ...graphQLOptions,
  });
};

const createOutputType = (type, fields) => {
  const { [GRAPHQL_OPTIONS_KEY]: graphQLOptions = {} } = type;

  return new GraphQLObjectType({
    fields,
    ...graphQLOptions,
  });
};

const typeCache = new Map();
const typeNames = new Set();

const generateOutputType = ({ schema, name, graphql, fields }) => {
  if (typeCache.has(schema)) {
    return typeCache.get(schema);
  }

  if (typeNames.has(name)) {
    throw new Error(
      `A duplicate name already exists for ${name}.  Please create a new name or reference the same schema`,
    );
  }

  typeNames.add(name);

  const outputType = createOutputType(
    {
      graphql: {
        name,
        ...graphql,
      },
      ...schema,
    },
    typeof fields === 'function' ? fields() : fields,
  );

  typeCache.set(schema, outputType);

  return outputType;
};

module.exports = {
  createInputType,
  createOutputType,
  generateOutputType,
};
