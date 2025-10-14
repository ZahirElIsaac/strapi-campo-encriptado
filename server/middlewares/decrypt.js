const { decrypt, isEncryptedField } = require('../utils/crypto');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    if (!ctx.body || !ctx.body.data) return;

    const decryptData = (data) => {
      if (!data || typeof data !== 'object') return;

      const contentType = ctx.params?.model || ctx.state?.route?.info?.type;
      if (!contentType) return;

      let model;
      try {
        model = strapi.getModel(contentType);
      } catch (e) {
        return;
      }

      if (!model?.attributes) return;

      for (const [key, attribute] of Object.entries(model.attributes)) {
        if (!isEncryptedField(attribute)) continue;
        
        if (data[key] && typeof data[key] === 'string') {
          try {
            data[key] = decrypt(data[key], strapi);
          } catch (error) {
            strapi.log.error(`Error descifrando campo ${key}: ${error.message}`);
          }
        }
      }
    };

    if (Array.isArray(ctx.body.data)) {
      ctx.body.data.forEach(decryptData);
    } else {
      decryptData(ctx.body.data);
    }
  };
};
