module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'encrypted-text',
    plugin: 'encrypted-field',
    type: 'text',
    inputSize: {
      default: 6,
      isResizable: true,
    },
  });
};
