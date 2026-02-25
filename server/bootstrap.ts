import { decrypt, encrypt, isEncryptedField, validateValue } from './utils/crypto';
import type {
  AttributeLike,
  ModelLike,
  StrapiLike,
  UnknownRecord,
} from './types';

const hasOwnProperty = (obj: UnknownRecord, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getModelAttributes = (
  strapi: StrapiLike,
  uid?: string
): Record<string, AttributeLike> => {
  if (!uid) {
    return {};
  }

  return strapi.getModel(uid)?.attributes ?? {};
};

const encryptFields = (
  data: UnknownRecord,
  attributes: Record<string, AttributeLike>,
  strapi: StrapiLike
): void => {
  for (const [key, attribute] of Object.entries(attributes)) {
    if (!isEncryptedField(attribute) || !hasOwnProperty(data, key)) {
      continue;
    }

    const value = data[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }

    const validation = validateValue(value, attribute);
    if (!validation.valid) {
      throw new Error(
        `Validation failed for the field "${key}": ${validation.error}`
      );
    }

    data[key] = encrypt(value, strapi);
  }
};

const decryptFields = (
  data: UnknownRecord,
  attributes: Record<string, AttributeLike>,
  strapi: StrapiLike
): void => {
  for (const [key, attribute] of Object.entries(attributes)) {
    if (!isEncryptedField(attribute) || !hasOwnProperty(data, key)) {
      continue;
    }

    const value = data[key];
    if (typeof value === 'string' && value) {
      data[key] = decrypt(value, strapi);
    }
  }
};

const bootstrap = ({ strapi }: { strapi: StrapiLike }): void => {
  const contentTypes = Object.values(strapi.contentTypes ?? {});
  const components = Object.values(strapi.components ?? {});
  const allModels = [...contentTypes, ...components] as ModelLike[];

  allModels.forEach((model) => {
    const attributes = model.attributes ?? {};
    const hasEncryptedFields = Object.values(attributes).some(isEncryptedField);

    if (!hasEncryptedFields) {
      return;
    }

    const uid = model.uid;
    if (!uid) {
      return;
    }

    strapi.db.lifecycles.subscribe({
      models: [uid],

      async beforeCreate(event) {
        const data = event.params.data;
        if (!isRecord(data) || !event.model?.uid) {
          return;
        }

        encryptFields(data, getModelAttributes(strapi, event.model.uid), strapi);
      },

      async beforeUpdate(event) {
        const data = event.params.data;
        if (!isRecord(data) || !event.model?.uid) {
          return;
        }

        encryptFields(data, getModelAttributes(strapi, event.model.uid), strapi);
      },

      async afterFindOne(event) {
        if (!isRecord(event.result) || !event.model?.uid) {
          return;
        }

        decryptFields(
          event.result,
          getModelAttributes(strapi, event.model.uid),
          strapi
        );
      },

      async afterFindMany(event) {
        if (!Array.isArray(event.result) || !event.model?.uid) {
          return;
        }

        const attributes = getModelAttributes(strapi, event.model.uid);

        for (const item of event.result) {
          if (isRecord(item)) {
            decryptFields(item, attributes, strapi);
          }
        }
      },
    });
  });
};

export default bootstrap;
