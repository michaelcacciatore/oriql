const { String } = require('../../../types');
const user = require('../user');

module.exports = {
  name: 'getFirstName',
  description: 'This gets the users first name based on their id',
  args: {
    id: String,
  },
  resolver: () => {},
  schema: user,
};
