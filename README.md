# nestjs-firebase-clean-arch

REST API de usuarios con NestJS, Firestore y Clean Architecture.

Proyecto para una prueba tecnica backend. El objetivo final es capturar usuarios
en Firestore y, cuando se cree un usuario sin `password`, disparar un evento que
genere un password seguro y actualice el registro.

## Stack

- TypeScript
- NestJS
- Firebase Admin SDK
- Cloud Firestore
- Firebase Emulator Suite
- Jest
- ESLint + Prettier

## Estado actual

- Fase 1 completada: capa de dominio en TypeScript puro.
- Tests unitarios de dominio en `test/unit/domain`.
- Coverage configurado para la capa de dominio con logica.
- CI en GitHub Actions para validar Pull Requests.

## Arquitectura actual

```text
src/domain/
├── entities/
│   └── user.entity.ts
├── errors/
│   └── invalid-user-data.error.ts
├── events/
│   └── user-created.event.ts
└── ports/
    ├── password-generator.ts
    ├── password-hasher.ts
    └── user.repository.ts
```

La capa `src/domain` no depende de NestJS, Firebase Admin SDK ni bcrypt.
Los adaptadores concretos se agregaran en fases posteriores.

## Requisitos

- Node.js
- npm
- Java instalado para ejecutar el emulador de Firestore
- Cuenta de Firebase solo si vas a crear/asociar un proyecto real con
  `npx firebase login` y `npx firebase init`

Para uso local con emulador, este repo usa el proyecto demo:

```text
demo-nestjs-firebase-clean-arch
```

## Instalacion

```bash
npm install
```

Crea tu archivo local de variables:

```bash
cp .env.example .env
```

Variables actuales:

```env
PORT=3000
FIREBASE_PROJECT_ID=demo-nestjs-firebase-clean-arch
FIRESTORE_EMULATOR_HOST=localhost:8080
```

## Ejecutar localmente

En una terminal, levanta Firestore Emulator:

```bash
npm run emulators
```

En otra terminal, levanta NestJS:

```bash
npm run start:dev
```

La app queda en:

```text
http://localhost:3000
```

Por ahora el endpoint base responde:

```bash
curl http://localhost:3000
```

Respuesta esperada:

```text
Hello World!
```

## Comandos

```bash
npm run start
```

Ejecuta la app NestJS una vez, sin modo watch.

```bash
npm run start:dev
```

Ejecuta la app en modo desarrollo con recarga al cambiar archivos.

```bash
npm run build
```

Compila TypeScript a `dist/`.

```bash
npm run start:prod
```

Ejecuta la version compilada desde `dist/main`.

```bash
npm run lint
```

Revisa reglas de ESLint en `src/` y `test/`.

```bash
npm run format
```

Formatea archivos TypeScript con Prettier.

```bash
npm test
```

Ejecuta pruebas unitarias. Actualmente incluye tests de dominio en
`test/unit/domain`.

```bash
npm run test:cov
```

Ejecuta pruebas unitarias con reporte de coverage.

```bash
npm run test:watch
```

Ejecuta pruebas unitarias en modo watch.

```bash
npm run test:e2e
```

Ejecuta pruebas end-to-end.

```bash
npm run emulators
```

Levanta Firebase Emulator Suite solo con Firestore.

```bash
npm run emulators:exec -- "npm run test:e2e"
```

Levanta el emulador, corre el comando indicado y apaga el emulador al terminar.

## CI

El workflow `.github/workflows/ci.yml` corre en Pull Requests y en pushes a
`main`.

Validaciones:

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run test:cov`
- `npm run build`

## Firebase y Firestore

Archivos relevantes:

- `.firebaserc`: alias del proyecto Firebase. Actualmente apunta a
  `demo-nestjs-firebase-clean-arch`.
- `firebase.json`: configuracion de Firestore, reglas e indices.
- `firestore.rules`: reglas de seguridad de Firestore.
- `firestore.indexes.json`: indices de Firestore.

Si necesitas rehacer la configuracion manual desde cero:

```bash
npx firebase login
npx firebase init
```

Selecciona solo:

```text
Firestore: Configure security rules and indexes files for Firestore
Emulators: Set up local emulators for Firebase products
```

En emuladores, selecciona solo:

```text
Firestore Emulator
Emulator UI
```
