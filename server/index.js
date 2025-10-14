const register = require('./register');
const bootstrap = require('./bootstrap');
const decrypt = require('./middlewares/decrypt');

module.exports = {
  register,
  bootstrap,
  middlewares: {
    decrypt,
  },
};
