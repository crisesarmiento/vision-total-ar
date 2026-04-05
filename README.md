# Vision AR

Vision AR es una plataforma premium de multiview para seguir todas las visiones de los medios argentinos en tiempo real. El objetivo es ofrecer una experiencia mucho más moderna, rápida y flexible que los mosaicos de noticias tradicionales.

## Stack
- Next.js 15 App Router + React 19
- TypeScript strict
- Tailwind CSS + componentes estilo shadcn/ui
- Prisma ORM + Prisma Postgres
- Better Auth
- Zustand
- TanStack Query
- UploadThing
- `@ducanh2912/next-pwa`

## Funcionalidades actuales
- Dashboard multiview con presets `1x1`, `2x1`, `2x2`, `3x3` y `4x4`
- Drag & drop de pantallas
- Controles por player: mute, volumen, play/pause, fullscreen
- Controles globales: mute, play y pause
- Biblioteca de canales argentinos en vivo
- Indicadores de `En vivo` y viewers por YouTube Data API
- Ticker opcional basado en RSS
- Better Auth con email/password, magic link y Google OAuth
- Perfil, configuración, rutas protegidas y avatar upload
- Combinaciones guardadas, favoritas y página pública compartible
- PWA, sitemap, robots, Open Graph e icon generado

## Primeros pasos
1. Instalar dependencias:

```bash
npm install
```

2. Copiar variables:

```bash
cp .env.example .env
```

3. Completar al menos:
- `DATABASE_URL`
- `PRISMA_DIRECT_TCP_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

4. Generar Prisma Client:

```bash
npm run prisma:generate
```

5. Crear la base y aplicar esquema:

```bash
npm run prisma:migrate -- --name init
```

6. Levantar el proyecto:

```bash
npm run dev
```

## Variables de entorno
```bash
DATABASE_URL=
PRISMA_DIRECT_TCP_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_APP_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
YOUTUBE_API_KEY=
RESEND_API_KEY=
MAGIC_LINK_FROM=
UPLOADTHING_TOKEN=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

## Comandos útiles
```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run version:patch
npm run version:minor
npm run version:major
npm run prisma:generate
npm run prisma:migrate
npm run db:push
npm run prisma:studio
```

## Prisma y base de datos
- El proyecto usa Prisma 7 con `prisma.config.ts`.
- `DATABASE_URL` se usa para Prisma CLI y migraciones.
- `PRISMA_DIRECT_TCP_URL` se usa para el `PrismaClient` en runtime con Prisma Postgres.
- El cliente usa `@prisma/adapter-ppg`.
- Si Prisma Postgres te entrega una sola URL `postgres://...`, podés usarla temporalmente como `PRISMA_DIRECT_TCP_URL`, pero la configuración recomendada es guardar también la URL de `DATABASE_URL` desde el dashboard de Prisma.

## Auth
- Better Auth expone rutas en `app/api/auth/[...all]/route.ts`
- El helper servidor vive en `lib/auth.ts`
- El cliente React vive en `lib/auth-client.ts`
- Middleware protege `perfil`, `configuracion` y `mis-combinaciones`

## Live data
- `lib/channels.ts`: catálogo de señales
- `lib/youtube.ts`: status y viewers en vivo con cache corto
- `lib/rss.ts`: agregación del ticker

## CI
GitHub Actions ejecuta:
- `npm run prisma:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `Dependency Review` en pull requests
- `CodeQL` en PRs, pushes y schedule

Archivos:
- `.github/workflows/ci.yml`
- `.github/workflows/dependency-review.yml`
- `.github/workflows/codeql.yml`

## Flujo de ramas
- `main`: producción
- `develop`: integración
- `feature/<LINEAR-ID>-slug`: features desde `develop`
- `fix/<LINEAR-ID>-slug`: fixes desde `develop`
- `chore/<LINEAR-ID>-slug`: tareas internas desde `develop`

### Flujo recomendado
1. Crear ticket en Linear.
2. Crear rama desde `develop` con el issue ID.
3. Abrir PR contra `develop`.
4. Esperar preview de Vercel + CI verde.
5. Si la PR prepara una release, subir la versión con `npm run version:patch`, `npm run version:minor` o `npm run version:major`.
6. Mergear a `develop`.
7. Si la versión cambió, GitHub crea una prerelease `vX.Y.Z-rc.N`.
8. Abrir release PR de `develop` hacia `main`.
9. Al mergear a `main`, GitHub crea la release estable `vX.Y.Z`.
10. Deploy de producción desde `main`.

## Linear
Proyecto creado:
- [Vision AR](https://linear.app/cris-emi/project/vision-ar-ff0d1270b233)

Issues iniciales:
- `CRIS-203` Setup base app + design system
- `CRIS-204` Setup Prisma + Prisma Postgres + Better Auth
- `CRIS-205` Implement channel library + live metadata service
- `CRIS-206` Build multiview dashboard + drag and drop
- `CRIS-207` Build combinations, favorites, and public sharing
- `CRIS-208` Build profile, settings, avatars, and protected routes
- `CRIS-209` Add PWA, keyboard shortcuts, SEO, and mobile polish
- `CRIS-210` Set up GitHub Actions + Vercel + branch protections
- `CRIS-211` Write README, env docs, and release checklist

## Vercel
Config recomendada:
- Importar repo `crisesarmiento/vision-total-ar`
- Production Branch = `main`
- Preview Deployments habilitados para PRs y ramas
- Cargar las mismas variables del `.env.example` en Preview y Production

## GitHub + Linear
Config recomendada:
- Activar integración GitHub en Linear
- Configurar GitHub Issues Sync entre el repo y el team correcto de Linear
- Usar branch names con issue ID
- Incluir issue ID en PR title o description
- Activar automatización de estados desde PRs
- Mantener el preview URL de Vercel en la PR

### Mirror de GitHub Project
- Workflow repo-side: `.github/workflows/project-mirror.yml`
- Script: `.github/scripts/sync-project-status.mjs`
- Secretos requeridos:
  - `GH_PROJECT_TOKEN`: token con permisos para actualizar el GitHub Project y leer el repo
  - `LINEAR_API_KEY`: opcional pero recomendado para reflejar el estado real de Linear cuando exista un `CRIS-###` en issue, PR o branch
- El workflow:
  - agrega issues y PRs al GitHub Project `Vision Total AR - Project`
  - refleja `Todo`, `In Progress`, `In Review` y `Done`
  - usa estado de Linear cuando puede resolver el issue ID
  - si no puede, cae a una heurística segura basada en el estado del issue/PR en GitHub

### Estrategia de milestones
- Los milestones de GitHub representan releases, no ciclos de Linear.
- Convención recomendada: `v0.1.0`, `v0.2.0`, etc.
- Crear el milestone cuando se abre un release batch real desde `develop`.
- No usar milestones para trabajo diario ni para reemplazar cycles de Linear.

## Versionado y releases
- Fuente de verdad: `package.json`.
- Workflow de prerelease: `.github/workflows/release-prerelease.yml`
- Workflow de release estable: `.github/workflows/release-stable.yml`
- Configuración de notas automáticas: `.github/release.yml`
- No requiere secrets extra: usa el `github.token` del workflow para crear tags y releases.
- Convención:
  - merge con cambio de versión a `develop` -> prerelease `vX.Y.Z-rc.N`
  - merge de esa misma versión a `main` -> release estable `vX.Y.Z`
- Si un merge a `develop` no cambia la versión, no se crea prerelease.
- Si `main` ya tiene el tag `vX.Y.Z`, el workflow no duplica la release.

## Branch protections
Aplicar manualmente en GitHub:
- `main`
  - Require pull request reviews
  - Require status checks
  - Require branches to be up to date
- `develop`
  - Require status checks
  - Require pull request before merge

Checks obligatorios:
- `quality`
- `Dependency Review`
- `CodeQL`
- `Project Mirror` si el repo decide volverlo obligatorio

## Seguridad
- Seguir [SECURITY.md](./SECURITY.md) para disclosure responsable
- Usar GitHub private vulnerability reporting en vez de issues públicos para reportes sensibles

## Estado de verificación
Validado localmente:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
