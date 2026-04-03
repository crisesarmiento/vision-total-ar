# Contribuir a Vision AR

## Flujo de ramas
- `main`: producción en Vercel.
- `develop`: integración y validación de features.
- `feature/<LINEAR-ID>-slug`: ramas de trabajo creadas desde `develop`.
- `fix/<LINEAR-ID>-slug`: hotfixes o correcciones puntuales.
- `chore/<LINEAR-ID>-slug`: mejoras internas, tooling y mantenimiento.

## Pull requests
- Las features van contra `develop`.
- Las releases van desde `develop` hacia `main`.
- Incluir el ID de Linear en el nombre de la rama y en la PR.
- Esperar que pasen `lint`, `typecheck`, `test` y `build`.

## Integraciones recomendadas
- Linear + GitHub:
  activar branch naming con issue ID y automatización por PR.
- Vercel:
  conectar el repo, dejar `main` como Production Branch y usar previews para PRs y ramas.
- GitHub:
  proteger `main` y `develop`, exigir review y checks obligatorios.
