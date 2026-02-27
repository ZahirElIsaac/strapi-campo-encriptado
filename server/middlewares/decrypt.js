const { decrypt, isEncryptedField } = require('../utils/crypto');

function resolveModelUidFromPath(ctx, strapi) {
  const path = ctx.request?.path || '';
  const match = path.match(/^\/api\/([^/]+)/);
  if (!match) return null;

  const slug = match[1];
  const contentTypes = Object.values(strapi.contentTypes);

  const ct = contentTypes.find((ct) => {
    const info = ct.info || {};
    return info.pluralName === slug || info.singularName === slug;
  });

  return ct?.uid || null;
}

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    if (!ctx.body) return;

    const rootModelUid = resolveModelUidFromPath(ctx, strapi);

    const decryptRecursive = (obj, modelUid = null) => {
      if (!obj || typeof obj !== 'object') return;

      if (Array.isArray(obj)) {
        obj.forEach((item) => decryptRecursive(item, modelUid));
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
        } catch (e) { }
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
      decryptRecursive(ctx.body.data, rootModelUid);
    } else {
      decryptRecursive(ctx.body, rootModelUid);
    }
  };
};
