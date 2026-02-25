import decryptMiddleware from './middlewares/decrypt';
import type { StrapiLike } from './types';

const register = ({ strapi }: { strapi: StrapiLike }): void => {
  strapi.server.use(decryptMiddleware({}, { strapi }));

  strapi.customFields.register({
    name: 'encrypted-text',
    plugin: 'encrypted-field',
    type: 'string',
  });
};

export default register;
