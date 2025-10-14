module.exports = ({ strapi }) => {
  const decryptMiddleware = require('./middlewares/decrypt');
  
  strapi.server.use(decryptMiddleware({}, { strapi }));
  
  strapi.customFields.register({
    name: 'encrypted-text',
    plugin: 'encrypted-field',
    type: 'string',
  });
};
