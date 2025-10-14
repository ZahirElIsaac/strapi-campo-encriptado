const { encrypt, decrypt, validateValue, isEncryptedField } = require('./utils/crypto');

module.exports = ({ strapi }) => {
  
  
  const contentTypes = Object.values(strapi.contentTypes);
  const components = Object.values(strapi.components);
  const allModels = [...contentTypes, ...components];
  
  allModels.forEach((model) => {
    const attributes = model.attributes || {};
    
    const encryptedFields = Object.entries(attributes)
      .filter(([key, attr]) => isEncryptedField(attr))
      .map(([key]) => key);
    
    if (encryptedFields.length === 0) return;

    const uid = model.uid;

  
    strapi.db.lifecycles.subscribe({
      models: [uid],
      
      async beforeCreate(event) {
        const { data } = event.params;
        
        if (!event.model?.uid) return;
        
        const currentModel = strapi.getModel(event.model.uid);
        
        if (!currentModel?.attributes) return;
        
        for (const [key, attribute] of Object.entries(currentModel.attributes)) {
          if (!isEncryptedField(attribute)) continue;
          
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            
            if (value === null || value === undefined || value === '') continue;
            
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
        const currentModel = strapi.getModel(event.model.uid);
        
        if (!currentModel?.attributes) return;
        
        for (const [key, attribute] of Object.entries(currentModel.attributes)) {
          if (!isEncryptedField(attribute)) continue;
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (value === null || value === undefined || value === '') continue;
            
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
        
        const currentModel = strapi.getModel(event.model.uid);
        
        if (!currentModel?.attributes) return;
        
        for (const [key, attribute] of Object.entries(currentModel.attributes)) {
          if (!isEncryptedField(attribute)) continue;
          if (Object.prototype.hasOwnProperty.call(result, key)) {
            const value = result[key];
            if (typeof value === 'string' && value) {
              result[key] = decrypt(value, strapi);
            }
          }
        }
      },

      async afterFindMany(event) {
        const { result } = event;
        if (!result || !Array.isArray(result)) return;
        if (!event.model?.uid) return;
        
        const currentModel = strapi.getModel(event.model.uid);
        
        if (!currentModel?.attributes) return;
        
        for (const item of result) {
          for (const [key, attribute] of Object.entries(currentModel.attributes)) {
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
  });
};
