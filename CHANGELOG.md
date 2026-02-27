# Changelog

All notable changes to this project will be documented in this file.

## [2.4.0] - 2026-02-26

### Added
- Key rotation script (`scripts/rotate-key.js`) for re-encrypting data when changing the encryption key.
- CHANGELOG.md with full version history.
- Documented `uniqueField` limitation in README (unique constraints don't work on encrypted fields due to random IV).

### Changed
- All server-side error messages and logs translated to English for global developer audience.
- `description` fields in `package.json` translated to English.
- `repository.url` fixed via `npm pkg fix` (normalized to `git+https://` format).

### Fixed
- `strapi.config.get()` path updated from deprecated `plugin.encrypted-field` to Strapi v5 convention `plugin::encrypted-field`.

## [2.3.3] - 2026-02-26

### Changed
- README rewritten in English for global npm community adoption.
- Removed unused `admin/src/pages/` directory.

## [2.3.2] - 2026-02-26

### Changed
- Restored detailed technical documentation in README (API examples, key management warnings, regex validation guide).

## [2.3.1] - 2026-02-26

### Changed
- README converted to bilingual format (EN/ES).
- Removed unused server directories (`content-types`, `controllers`, `routes`, `services`).
- Added `.npmignore` for cleaner npm package.

## [2.3.0] - 2026-02-26

### Added
- Multi-language support (i18n): English and Spanish translations for admin UI.
- Encryption key caching in memory for improved performance.
- `inputSize` configuration for resizable inputs in Content-Type Builder.
- Plugin `config` block with `default` and `validator` (Strapi v5 standard).
- `@strapi/design-system` and `react` as `peerDependencies`.

### Changed
- Refactored lifecycle hooks (`bootstrap.js`): extracted shared `processEncryption` and `processDecryption` functions to eliminate code duplication.
- Simplified `registerTrads` to native Strapi v5 async/await pattern.

### Fixed
- Decrypt middleware now resolves the root entity `modelUid` from the API request path, fixing a bug where top-level encrypted fields were not decrypted in API responses.

## [2.2.1] - 2025-10-14

### Added
- Visibility toggle (show/hide) and copy-to-clipboard controls with confirmation notifications in admin UI.

### Changed
- Updated README with improved documentation and package metadata.

## [2.0.4] - 2025-10-13

### Removed
- Placeholder field option removed after multiple iterations.

## [2.0.3] - 2025-10-13

### Fixed
- Set predefined placeholder and removed customization option.

## [2.0.1] - 2025-10-13

### Added
- Nested component support for encryption/decryption at any depth.
- Decrypt middleware for API responses.
- Regex and length validation before encryption.

### Changed
- Simplified encrypted field UI.
- Improved props handling in Input component.
- Field type changed to `string`.
- Removed unnecessary code comments.

## [1.0.1] - 2025-10-13

### Added
- Package exports configuration for Strapi v5.

## [1.0.0] - 2025-10-13

### Added
- Initial release.
- Custom field "Encrypted Text" for Content-Type Builder.
- AES-256-GCM encryption/decryption.
- Basic admin panel input component.
