# Strapi Plugin - Encrypted Field

<div align="center">
  <img src="https://img.shields.io/npm/v/@growy/strapi-plugin-encrypted-field" alt="npm version" />
  <img src="https://img.shields.io/npm/l/@growy/strapi-plugin-encrypted-field" alt="license" />
  <img src="https://img.shields.io/badge/Strapi-v5-blueviolet" alt="Strapi v5" />
</div>

---

### [English](#english-version) | [Español](#versión-en-español)

---

## English Version

Official **Growy AI** plugin for Strapi that provide a custom encrypted text field using AES-256-GCM. Protect sensitive information directly in your database with transparent encryption and robust validation.

### Features

- ✅ **Custom Field** "Encrypted Text" in the Content-Type Builder.
- ✅ **Automatic Encryption** AES-256-GCM when saving.
- ✅ **Transparent Decryption** when reading (Admin panel and API).
- ✅ **Backend Validation** with regex support and length constraints.
- ✅ **Native Strapi v5 UI** with visibility controls and copy to clipboard.
- ✅ **Multi-language support (i18n)**: English and Spanish.
- ✅ **Secure Key Management** with validation and clear error messages.
- ✅ **Encrypted Data** in database with unique IV and Auth Tag.
- ✅ **Nested Components support** at any depth.

### Installation

```bash
npm install @growy/strapi-plugin-encrypted-field
# or
yarn add @growy/strapi-plugin-encrypted-field
```

### Configuration

#### 1. Enable the plugin

Create or edit `config/plugins.js` or `config/plugins.ts`:

```javascript
module.exports = {
  'encrypted-field': {
    enabled: true,
  },
};
```

#### 2. Configure Encryption Key (REQUIRED)

Add to your `.env`:

```bash
ENCRYPTION_KEY=your_64_character_hex_key_here
```

Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Usage

1. Go to **Content-Type Builder**.
2. Select a collection or create a new one.
3. Click on **"Add another field"**.
4. Select **"Encrypted Text"** (look for the 🔒 icon).
5. Values are hidden by default in the Admin Panel but can be revealed or copied using the inline buttons.

---

## Versión en Español

Plugin oficial de **Growy AI** para Strapi que proporciona un campo personalizado de texto cifrado con AES-256-GCM. Protege información sensible directamente en tu base de datos con cifrado transparente y validación robusta.

### Características

- ✅ **Campo personalizado** "Texto Cifrado" en el Content-Type Builder.
- ✅ **Cifrado automático** AES-256-GCM al guardar.
- ✅ **Descifrado transparente** al leer (panel y API).
- ✅ **Validación backend** con soporte para regex y restricciones.
- ✅ **UI Nativa Strapi v5** con controles de visibilidad y copiar al portapapeles.
- ✅ **Soporte multi-idioma (i18n)**: Inglés y Español.
- ✅ **Gestión de claves robusta** con validación y mensajes de error claros.
- ✅ **Datos cifrados** en base de datos con IV único y Auth Tag.
- ✅ **Soporte para componentes anidados** a cualquier profundidad.

### Instalación

```bash
npm install @growy/strapi-plugin-encrypted-field
# o
yarn add @growy/strapi-plugin-encrypted-field
```

### Configuración

#### 1. Habilitar el plugin

Edita `config/plugins.js`:

```javascript
module.exports = {
  'encrypted-field': {
    enabled: true,
  },
};
```

#### 2. Configurar la clave (REQUERIDO)

Agrega a tu `.env`:

```bash
ENCRYPTION_KEY=tu_clave_de_64_caracteres_hexadecimales_aqui
```

### Uso

1. Ve a **Content-Type Builder**.
2. Selecciona una colección.
3. Click en **"Add another field"**.
4. Selecciona **"Texto Cifrado"** (icono 🔒).
5. Los valores están ocultos por defecto en el panel pero pueden mostrarse o copiarse con los botones integrados.

### Seguridad y Especificaciones

- **Algoritmo**: AES-256-GCM.
- **IV (Initialization Vector)**: 96 bits generado aleatoriamente por operación.
- **Auth Tag**: 128 bits para verificación de integridad.
- **Formato almacenado**: `iv:authTag:encryptedData`.

### Limitaciones

- ❌ **Búsqueda**: No se puede buscar por campos cifrados.
- ❌ **Ordenamiento**: No se puede ordenar por campos cifrados.
- ❌ **Filtros**: No se pueden aplicar filtros directos sobre datos cifrados.

---

## License / Licencia

MIT © 2025 Growy AI

## Credits / Créditos

**Growy AI** - Soluciones de IA y automatización empresarial

**Main Author / Autor principal**: Zahir El isaac

---

<div align="center">
  <p>If this plugin is useful to you, consider giving it a ⭐ on GitHub / Si este plugin te resulta útil, considera darle una ⭐ en GitHub</p>
  <p>Made with ❤️ by Growy AI Team</p>
</div>
