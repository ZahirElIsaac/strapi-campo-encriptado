module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'encrypted-text',
    plugin: 'encrypted-field',
    type: 'string',
  });
};
