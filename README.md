# Strapi Plugin - Encrypted Field

<div align="center">
  <img src="https://img.shields.io/npm/v/@growy/strapi-plugin-encrypted-field" alt="npm version" />
  <img src="https://img.shields.io/npm/l/@growy/strapi-plugin-encrypted-field" alt="license" />
  <img src="https://img.shields.io/badge/Strapi-v5-blueviolet" alt="Strapi v5" />
</div>

Plugin oficial de **Growy AI** para Strapi que proporciona un campo personalizado de texto cifrado con AES-256-GCM. Protege información sensible directamente en tu base de datos con cifrado transparente y validación robusta.


- ✅ **Campo personalizado** "Texto Cifrado" en el Content-Type Builder
- ✅ **Cifrado automático** AES-256-GCM al guardar
- ✅ **Descifrado transparente** al leer (panel y API)
- ✅ **Validación backend** con soporte para regex y restricciones
- ✅ **UI mejorada** con controles de visibilidad y copiar al portapapeles
- ✅ **Valores ocultos** por defecto con opción de mostrar/ocultar
- ✅ **Notificaciones** de confirmación al copiar valores
- ✅ **Gestión de claves robusta** con validación y mensajes de error claros
- ✅ **Datos cifrados** en base de datos con IV único y Auth Tag
- ✅ **Reutilizable** en cualquier colección o componente
- ✅ **Soporte completo** para componentes anidados y estructuras complejas

## Instalación

### Desde npm

```bash
npm install @growy/strapi-plugin-encrypted-field
```

### Desde yarn

```bash
yarn add @growy/strapi-plugin-encrypted-field
```

## Configuración

### 1. Habilitar el plugin

Crea o edita `config/plugins.js` o `config/plugins.ts`:

```javascript
module.exports = {
  'encrypted-field': {
    enabled: true,
  },
};
```

### 2. Configurar la clave de cifrado (REQUERIDO)

#### Opción A: Variable de entorno (recomendado)

Agrega a tu `.env`:

```bash
ENCRYPTION_KEY=tu_clave_de_64_caracteres_hexadecimales_aqui
```

#### Opción B: Archivo de configuración

Edita `config/plugins.js`:

```javascript
module.exports = ({ env }) => ({
  'encrypted-field': {
    enabled: true,
    config: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
  },
});
```

#### Generar clave segura

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Esto generará una clave de 64 caracteres hexadecimales (32 bytes).

⚠️ **CRÍTICO - Gestión de claves**:
- **Guarda la clave de forma segura** (gestor de secretos, variables de entorno cifradas)
- **Nunca** la incluyas en el control de versiones
- **Si pierdes la clave**, no podrás descifrar los datos existentes
- **Usa la misma clave** en todos los entornos que compartan la misma base de datos
- **Para producción**, considera usar servicios como AWS Secrets Manager, HashiCorp Vault o similar

### 3. Rebuild del admin

```bash
npm run build
npm run develop
```

## Requisitos

- **Strapi**: v5.0.0 o superior
- **Node.js**: 18.x - 22.x
- **npm**: 6.0.0 o superior

## Validación de datos

El plugin soporta validación antes del cifrado:

### Configurar validación regex

1. En el Content-Type Builder, selecciona el campo cifrado
2. Ve a la pestaña **"Advanced Settings"**
3. En **"RegEx pattern"**, ingresa tu expresión regular
4. Guarda los cambios

**Ejemplo**: Para validar formato de API key:
```regex
^sk-[a-zA-Z0-9]{32}$
```

Si el valor no cumple con el patrón, se lanzará un error antes de cifrar.

## Uso

### 1. Agregar campo cifrado a una colección

1. Ve a **Content-Type Builder**
2. Selecciona una colección o crea una nueva
3. Click en **"Add another field"**
4. Busca **"Texto Cifrado"** (con icono 🔒)
5. Configura el nombre del campo
6. Guarda y reinicia Strapi

### 2. Usar el campo

El campo funciona como un campo de texto normal con características de seguridad adicionales:

- **En el panel**: Escribe texto normalmente
- **Valores ocultos**: Los valores se muestran como `***` por defecto
- **Botón ojo**: Alterna entre mostrar/ocultar el valor
- **Botón copiar**: Copia el valor al portapapeles con notificación de confirmación
- **Placeholder personalizable**: Configura un placeholder desde las opciones del campo
- **Al guardar**: Se cifra automáticamente
- **Al leer**: Se descifra automáticamente
- **En la BD**: Se guarda cifrado con formato `iv:authTag:encrypted`
- **En componentes**: Funciona igual en componentes anidados de cualquier profundidad

### 3. Uso por API

```bash
# Crear con campo cifrado
curl -X POST http://localhost:1337/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nombre": "Juan",
      "apiKey": "mi-clave-secreta-123"
    }
  }'

# Leer (devuelve descifrado)
curl -X GET http://localhost:1337/api/usuarios/1
# Response: { "nombre": "Juan", "apiKey": "mi-clave-secreta-123" }
```

## Ejemplo de uso

### Colección "Usuario" con API Key cifrada

**Schema:**
```json
{
  "nombre": "string",
  "email": "email",
  "apiKey": "plugin::encrypted-field.encrypted-text"
}
```

**En la BD:**
```
apiKey: "a1b2c3d4e5f6....:f9e8d7c6b5a4....:9f8e7d6c5b4a3..."
```

**En el panel y API:**
```
apiKey: "sk-1234567890abcdef"
```

## Seguridad y arquitectura

### Especificaciones técnicas

- **Algoritmo**: AES-256-GCM (estándar NIST, grado militar)
- **Tamaño de clave**: 256 bits (32 bytes, 64 caracteres hexadecimales)
- **IV (Initialization Vector)**: 96 bits (12 bytes) generado aleatoriamente por operación
- **Auth Tag**: 128 bits (16 bytes) para verificación de integridad
- **Formato almacenado**: `iv:authTag:encryptedData` (todos en hexadecimal)

### Características de seguridad

- ✅ **Cifrado autenticado**: GCM proporciona confidencialidad e integridad
- ✅ **IV único**: Cada operación de cifrado genera un IV aleatorio
- ✅ **Resistencia a manipulación**: Auth Tag detecta cualquier modificación
- ✅ **Validación de entrada**: Soporte para regex y restricciones personalizadas
- ✅ **Manejo de errores seguro**: Logs controlados sin exponer datos sensibles

### Mejores prácticas

1. **Rotación de claves**: Planifica un proceso de rotación periódica
2. **Separación de entornos**: Usa claves diferentes para dev/staging/prod
3. **Auditoría**: Monitorea logs de errores de cifrado/descifrado
4. **Backup de claves**: Mantén copias seguras de las claves en múltiples ubicaciones
5. **Campos privados**: Marca campos sensibles como "privados" para excluirlos de la API pública

## Casos de uso

- 🔑 API Keys de terceros
- 🔐 Tokens de acceso
- 🔒 Secretos de webhooks
- 💳 Información sensible
- 📧 Credenciales SMTP
- 🔑 Contraseñas de aplicaciones

## Limitaciones conocidas

- ❌ **Búsqueda**: No se puede buscar por campos cifrados (datos cifrados en BD)
- ❌ **Ordenamiento**: No se puede ordenar por campos cifrados
- ❌ **Filtros**: No se pueden aplicar filtros directos sobre campos cifrados
- ⚠️ **Rendimiento**: El cifrado/descifrado añade overhead mínimo (~1-2ms por operación)
- ⚠️ **Sincronización de claves**: Todos los entornos que compartan BD deben usar la misma clave

## Licencia

MIT © 2025 Growy AI

## Desarrollado por

**Growy AI** - Soluciones de IA y automatización empresarial

**Autor principal**: Zahir El isaac

---

<div align="center">
  <p>Si este plugin te resulta útil, considera darle una ⭐ en GitHub</p>
  <p>Hecho con ❤️ por el equipo de Growy AI</p>
</div>
