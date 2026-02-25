import { decrypt, isEncryptedField } from '../utils/crypto';
import type {
  KoaMiddlewareLike,
  ModelLike,
  StrapiLike,
  UnknownRecord,
} from '../types';

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const decryptMiddleware = (
  _config: unknown,
  { strapi }: { strapi: StrapiLike }
): KoaMiddlewareLike => {
  return async (ctx, next) => {
    await next();

    if (!ctx.body) {
      return;
    }

    const decryptRecursive = (obj: unknown, modelUid: string | null = null): void => {
      if (Array.isArray(obj)) {
        obj.forEach((item) => decryptRecursive(item, modelUid));
        return;
      }

      if (!isRecord(obj)) {
        return;
      }

      const componentUid =
        typeof obj.__component === 'string' ? obj.__component : null;
      const currentModelUid = componentUid ?? modelUid;

      let model: ModelLike | undefined;
      if (currentModelUid) {
        try {
          model =
            strapi.getModel(currentModelUid) ?? strapi.components[currentModelUid];
        } catch {
          model = undefined;
        }
      }

      if (model?.attributes) {
        for (const [key, attribute] of Object.entries(model.attributes)) {
          const currentValue = obj[key];
          if (
            isEncryptedField(attribute) &&
            currentValue &&
            typeof currentValue === 'string'
          ) {
            try {
              obj[key] = decrypt(currentValue, strapi);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);
              strapi.log?.error?.(`Error decrypting field ${key}: ${message}`);
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

    if (isRecord(ctx.body) && 'data' in ctx.body) {
      decryptRecursive(ctx.body.data);
      return;
    }

    decryptRecursive(ctx.body);
  };
};

export default decryptMiddleware;
