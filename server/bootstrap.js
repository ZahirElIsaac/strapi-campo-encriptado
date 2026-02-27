const { encrypt, decrypt, validateValue, isEncryptedField } = require('./utils/crypto');

function processEncryption(event, strapi) {
  if (!event.model?.uid) return;

  const { data } = event.params;
  const currentModel = strapi.getModel(event.model.uid);

  if (!currentModel?.attributes) return;

  for (const [key, attribute] of Object.entries(currentModel.attributes)) {
    if (!isEncryptedField(attribute)) continue;
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

    const value = data[key];
    if (value === null || value === undefined || value === '') continue;

    const validation = validateValue(value, attribute);
    if (!validation.valid) {
      throw new Error(`Validación fallida para el campo "${key}": ${validation.error}`);
    }

    data[key] = encrypt(value, strapi);
  }
}

function processDecryption(result, event, strapi) {
  if (!result) return;
  if (!event.model?.uid) return;

  const currentModel = strapi.getModel(event.model.uid);
  if (!currentModel?.attributes) return;

  for (const [key, attribute] of Object.entries(currentModel.attributes)) {
    if (!isEncryptedField(attribute)) continue;
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;

    const value = result[key];
    if (typeof value === 'string' && value) {
      result[key] = decrypt(value, strapi);
    }
  }
}

module.exports = ({ strapi }) => {
  const allModels = [
    ...Object.values(strapi.contentTypes),
    ...Object.values(strapi.components),
  ];

  allModels.forEach((model) => {
    const attributes = model.attributes || {};
    const hasEncryptedFields = Object.values(attributes).some(isEncryptedField);

    if (!hasEncryptedFields) return;

    strapi.db.lifecycles.subscribe({
      models: [model.uid],

      async beforeCreate(event) {
        processEncryption(event, strapi);
      },

      async beforeUpdate(event) {
        processEncryption(event, strapi);
      },

      async afterFindOne(event) {
        processDecryption(event.result, event, strapi);
      },

      async afterFindMany(event) {
        const { result } = event;
        if (!result || !Array.isArray(result)) return;
        for (const item of result) {
          processDecryption(item, event, strapi);
        }
      },
    });
  });
};
