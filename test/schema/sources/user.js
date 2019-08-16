const schema = require('../user');
const { String } = require('../../../types');

module.exports = {
  name: 'user',
  args: {
    id: String,
  },
  resolver: () => {},
  schema,
};
