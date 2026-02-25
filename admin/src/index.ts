import en from './translations/en.json';
import es from './translations/es.json';

type TradData = Record<string, string>;

interface AppLike {
  customFields: {
    register: (config: unknown) => void;
  };
}

interface RegisterTradsArgs {
  locales: string[];
}

const TRANSLATIONS: Record<string, TradData> = {
  en,
  es,
};

const plugin = {
  register(app: AppLike): void {
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
        defaultMessage:
          'Campo de texto que se cifra automáticamente con AES-256-GCM',
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

  async registerTrads({ locales }: RegisterTradsArgs): Promise<
    Array<{ data: TradData; locale: string }>
  > {
    return locales.map((locale) => ({
      data: TRANSLATIONS[locale] ?? {},
      locale,
    }));
  },
};

export default plugin;
