const { encrypt, decrypt, validateValue, isEncryptedField } = require('./utils/crypto');

module.exports = ({ strapi }) => {
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
          if (value === null || value === undefined) continue;
          
          const validation = validateValue(value, attribute);
          if (!validation.valid) {
            throw new Error(`Validación fallida para el campo "${key}": ${validation.error}`);
          }
          
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
          if (value === null || value === undefined) continue;
          
          const validation = validateValue(value, attribute);
          if (!validation.valid) {
            throw new Error(`Validación fallida para el campo "${key}": ${validation.error}`);
          }
          
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
          if (typeof value === 'string') {
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
            if (typeof value === 'string') {
              item[key] = decrypt(value, strapi);
            }
          }
        }
      }
    },
  });
};
