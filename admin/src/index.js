export default {
  register(app) {
    app.customFields.register({
      name: 'encrypted-text',
      pluginId: 'encrypted-field',
      type: 'string',
      intlLabel: {
        id: 'encrypted-field.label',
        defaultMessage: 'Texto Cifrado',
      },
      intlDescription: {
        id: 'encrypted-field.description',
        defaultMessage: 'Campo de texto que se cifra automáticamente con AES-256-GCM',
      },
      components: {
        Input: async () => import('./components/Input').then((module) => ({
          default: module.default,
        })),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: 'encrypted-field.options.base.settings',
              defaultMessage: 'Configuración',
            },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: 'encrypted-field.options.required.label',
                  defaultMessage: 'Campo requerido',
                },
                description: {
                  id: 'encrypted-field.options.required.description',
                  defaultMessage: 'No se podrá guardar sin este campo',
                },
              },
              {
                name: 'private',
                type: 'checkbox',
                intlLabel: {
                  id: 'encrypted-field.options.private.label',
                  defaultMessage: 'Campo privado',
                },
                description: {
                  id: 'encrypted-field.options.private.description',
                  defaultMessage: 'Este campo no será devuelto por la API',
                },
              },
              {
                name: 'maxLength',
                type: 'number',
                intlLabel: {
                  id: 'encrypted-field.options.maxLength.label',
                  defaultMessage: 'Longitud máxima',
                },
                description: {
                  id: 'encrypted-field.options.maxLength.description',
                  defaultMessage: 'Número máximo de caracteres permitidos',
                },
              },
              {
                name: 'minLength',
                type: 'number',
                intlLabel: {
                  id: 'encrypted-field.options.minLength.label',
                  defaultMessage: 'Longitud mínima',
                },
                description: {
                  id: 'encrypted-field.options.minLength.description',
                  defaultMessage: 'Número mínimo de caracteres requeridos',
                },
              },
              {
                name: 'placeholder',
                type: 'text',
                intlLabel: {
                  id: 'encrypted-field.options.placeholder.label',
                  defaultMessage: 'Placeholder',
                },
                description: {
                  id: 'encrypted-field.options.placeholder.description',
                  defaultMessage: 'Texto de ayuda que se muestra en el campo',
                },
              },
            ],
          },
        ],
        advanced: [
          {
            sectionTitle: {
              id: 'encrypted-field.options.advanced.regex',
              defaultMessage: 'Validación',
            },
            items: [
              {
                name: 'regex',
                type: 'text',
                intlLabel: {
                  id: 'encrypted-field.options.regex.label',
                  defaultMessage: 'RegEx pattern',
                },
                description: {
                  id: 'encrypted-field.options.regex.description',
                  defaultMessage: 'Patrón de validación antes de cifrar',
                },
              },
            ],
          },
        ],
      },
    });
  },

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data,
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
