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
- ✅ **Native Strapi v5 UI** with visibility controls, redimensionable inputs and copy to clipboard.
- ✅ **Multi-language support (i18n)**: English and Spanish.
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
Edit `config/plugins.js` or `config/plugins.ts`:
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

**Generate a secure key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

⚠️ **CRITICAL - Key Management**:
- **Store the key safely** (Secrets manager, encrypted env vars).
- **Never** include it in version control.
- **If you lose the key**, you will NOT be able to decrypt existing data.
- **Use the same key** across all environments sharing the same database.

### Usage & Validation

#### Data Validation
The plugin supports validation before encryption:
1. In Content-Type Builder, select the encrypted field.
2. Go to **"Advanced Settings"**.
3. In **"RegEx pattern"**, enter your regular expression.
**Example**: To validate an API key format: `^sk-[a-zA-Z0-9]{32}$`.

#### API Usage
The API returns decrypted values automatically for authorized requests.
```bash
# Create an entry
curl -X POST http://localhost:1337/api/users \
  -H "Content-Type: application/json" \
  -d '{"data": {"apiKey": "my-secret-token"}}'

# Read (returns decrypted)
curl -X GET http://localhost:1337/api/users/1
# Response: { "data": { "apiKey": "my-secret-token" } }
```

---

## Versión en Español

Plugin oficial de **Growy AI** para Strapi que proporciona un campo personalizado de texto cifrado con AES-256-GCM. Protege información sensible directamente en tu base de datos con cifrado transparente y validación robusta.

### Características

- ✅ **Campo personalizado** "Texto Cifrado" en el Content-Type Builder.
- ✅ **Cifrado automático** AES-256-GCM al guardar.
- ✅ **Descifrado transparente** al leer (panel y API).
- ✅ **Validación backend** con soporte para regex y restricciones.
- ✅ **UI Nativa Strapi v5** con controles de visibilidad, inputs redimensionables y copiar al portapapeles.
- ✅ **Soporte multi-idioma (i18n)**: Inglés y Español.
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

⚠️ **CRÍTICO - Gestión de claves**:
- **Guarda la clave de forma segura** (gestor de secretos, variables de entorno cifradas).
- **Nunca** la incluyas en el control de versiones.
- **Si pierdes la clave**, NO podrás descifrar los datos existentes.

### Uso y Validación

#### Validación de datos
El plugin soporta validación antes del cifrado:
1. En el Content-Type Builder, selecciona el campo cifrado.
2. Ve a la pestaña **"Advanced Settings"**.
3. En **"RegEx pattern"**, ingresa tu expresión regular.
**Ejemplo**: Para validar formato de API key: `^sk-[a-zA-Z0-9]{32}$`.

#### Uso por API
La API devuelve los valores descifrados automáticamente.
```bash
# Crear con campo cifrado
curl -X POST http://localhost:1337/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"data": {"apiKey": "mi-clave-secreta-123"}}'

# Leer (devuelve descifrado)
curl -X GET http://localhost:1337/api/usuarios/1
# Response: { "apiKey": "mi-clave-secreta-123" }
```

### Especificaciones Técnicas

- **Algoritmo**: AES-256-GCM (Grado militar).
- **IV (Initialization Vector)**: 96 bits generado aleatoriamente por operación.
- **Integridad**: Auth Tag de 128 bits para detectar manipulaciones.
- **Formato almacenado**: `iv:authTag:encryptedData`.

### Limitaciones Conocidas

- ❌ **Búsqueda**: No se puede buscar por campos cifrados debido al cifrado en BD.
- ❌ **Ordenamiento**: No se puede ordenar por campos cifrados.
- ❌ **Filtros**: No se pueden aplicar filtros directos en la consulta a la BD.

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
