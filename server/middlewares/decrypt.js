const { decrypt, isEncryptedField } = require('../utils/crypto');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    if (!ctx.body) return;

    // Función recursiva para descifrar campos en cualquier nivel de anidación
    const decryptRecursive = (obj, modelUid = null) => {
      if (!obj || typeof obj !== 'object') return;

      // Si es un array, procesar cada elemento
      if (Array.isArray(obj)) {
        obj.forEach(item => decryptRecursive(item, modelUid));
        return;
      }

      // Detectar si es un componente por el campo __component
      let currentModelUid = modelUid;
      if (obj.__component) {
        currentModelUid = obj.__component;
      }

      // Obtener el modelo si tenemos un UID
      let model = null;
      if (currentModelUid) {
        try {
          model = strapi.getModel(currentModelUid) || strapi.components[currentModelUid];
        } catch (e) {
          // Ignorar si no se encuentra el modelo
        }
      }

      // Descifrar campos del modelo actual
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

      // Procesar recursivamente todos los valores del objeto
      for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
          decryptRecursive(value, currentModelUid);
        }
      }
    };

    // Procesar ctx.body.data si existe
    if (ctx.body.data) {
      decryptRecursive(ctx.body.data);
    } else {
      // Procesar ctx.body directamente
      decryptRecursive(ctx.body);
    }
  };
};
