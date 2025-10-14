const { encrypt, decrypt, validateValue, isEncryptedField } = require('./utils/crypto');

module.exports = ({ strapi }) => {
  // Registrar middleware de descifrado
  strapi.server.use(async (ctx, next) => {
    await next();

    if (!ctx.body || !ctx.body.data) return;

    const decryptData = (data) => {
      if (!data || typeof data !== 'object') return;

      // Intentar obtener el modelo del content type
      const uid = ctx.state?.route?.info?.apiName 
        ? `api::${ctx.state.route.info.apiName}.${ctx.state.route.info.apiName}`
        : null;

      if (!uid) return;

      let model;
      try {
        model = strapi.getModel(uid);
      } catch (e) {
        return;
      }

      if (!model?.attributes) return;

      for (const [key, attribute] of Object.entries(model.attributes)) {
        if (!isEncryptedField(attribute)) continue;
        
        if (data[key] && typeof data[key] === 'string') {
          try {
            const decrypted = decrypt(data[key], strapi);
            strapi.log.info(`Descifrando campo ${key} en respuesta API`);
            data[key] = decrypted;
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
  });

  strapi.db.lifecycles.subscribe({
    async beforeCreate(event) {
      if (!event.model?.uid) return;
      
      const { data } = event.params;
      const model = strapi.getModel(event.model.uid);
      
      if (!model?.attributes) return;
      
      for (const [key, attribute] of Object.entries(model.attributes)) {
        if (!isEncryptedField(attribute)) continue;
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          if (value === null || value === undefined || value === '') continue;
          
          // No cifrar si ya está cifrado (formato: iv:authTag:encrypted)
          if (typeof value === 'string' && value.split(':').length === 3) {
            strapi.log.info(`Campo ${key} ya está cifrado, saltando cifrado`);
            continue;
          }
          
          const validation = validateValue(value, attribute);
          if (!validation.valid) {
            throw new Error(`Validación fallida para el campo "${key}": ${validation.error}`);
          }
          
          strapi.log.info(`Cifrando campo ${key} en ${event.model.uid}`);
          data[key] = encrypt(value, strapi);
        }
      }
    },

    async beforeUpdate(event) {
      if (!event.model?.uid) return;
      
      const { data } = event.params;
      const model = strapi.getModel(event.model.uid);
      
      if (!model?.attributes) return;
      
      for (const [key, attribute] of Object.entries(model.attributes)) {
        if (!isEncryptedField(attribute)) continue;
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          if (value === null || value === undefined || value === '') continue;
          
          // No cifrar si ya está cifrado (formato: iv:authTag:encrypted)
          if (typeof value === 'string' && value.split(':').length === 3) {
            strapi.log.info(`Campo ${key} ya está cifrado, saltando cifrado`);
            continue;
          }
          
          const validation = validateValue(value, attribute);
          if (!validation.valid) {
            throw new Error(`Validación fallida para el campo "${key}": ${validation.error}`);
          }
          
          strapi.log.info(`Cifrando campo ${key} en ${event.model.uid}`);
          data[key] = encrypt(value, strapi);
        }
      }
    },

    async afterFindOne(event) {
      const { result } = event;
      if (!result) return;
      if (!event.model?.uid) return;
      
      const model = strapi.getModel(event.model.uid);
      
      if (!model?.attributes) return;
      
      for (const [key, attribute] of Object.entries(model.attributes)) {
        if (!isEncryptedField(attribute)) continue;
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          const value = result[key];
          if (typeof value === 'string' && value) {
            strapi.log.info(`Descifrando campo ${key} en ${event.model.uid}`);
            result[key] = decrypt(value, strapi);
          }
        }
      }
    },

    async afterFindMany(event) {
      const { result } = event;
      if (!result || !Array.isArray(result)) return;
      if (!event.model?.uid) return;
      
      const model = strapi.getModel(event.model.uid);
      
      if (!model?.attributes) return;
      
      for (const item of result) {
        for (const [key, attribute] of Object.entries(model.attributes)) {
          if (!isEncryptedField(attribute)) continue;
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            const value = item[key];
            if (typeof value === 'string' && value) {
              item[key] = decrypt(value, strapi);
            }
          }
        }
      }
    },
  });
};
