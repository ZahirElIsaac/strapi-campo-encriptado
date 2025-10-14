const { decrypt, isEncryptedField } = require('../utils/crypto');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    if (!ctx.body) return;

    
    const decryptRecursive = (obj, modelUid = null) => {
      if (!obj || typeof obj !== 'object') return;

    
      if (Array.isArray(obj)) {
        obj.forEach(item => decryptRecursive(item, modelUid));
        return;
      }

      
      let currentModelUid = modelUid;
      if (obj.__component) {
        currentModelUid = obj.__component;
      }

      
      let model = null;
      if (currentModelUid) {
        try {
          model = strapi.getModel(currentModelUid) || strapi.components[currentModelUid];
        } catch (e) {
          
        }
      }

      
      if (model?.attributes) {
        for (const [key, attribute] of Object.entries(model.attributes)) {
          if (isEncryptedField(attribute) && obj[key] && typeof obj[key] === 'string') {
            try {
              obj[key] = decrypt(obj[key], strapi);
            } catch (error) {
              strapi.log.error(`Error descifrando campo ${key}: ${error.message}`);
            }
          }
        }
      }

      
      for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
          decryptRecursive(value, currentModelUid);
        }
      }
    };

    
    if (ctx.body.data) {
      decryptRecursive(ctx.body.data);
    } else {
      
      decryptRecursive(ctx.body);
    }
  };
};
