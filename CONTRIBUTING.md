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
- Esperar que pasen `lint`, `typecheck`, `test`, `build`, `Dependency Review` y `CodeQL`.
- Si la PR prepara una release, incluir el bump de versión en `package.json` y `package-lock.json`.

## Issues
- Bugs y feature requests abiertos por la comunidad entran por GitHub Issues.
- Si el repo tiene GitHub Issues Sync configurado en Linear, esos issues pueden sincronizarse de forma nativa.
- Maintainers pueden mover la ejecución a Linear sin perder el contexto original.
- Para vulnerabilidades, seguir `SECURITY.md` y evitar el issue público.

## Integraciones recomendadas
- Linear + GitHub:
  activar branch naming con issue ID, automatización por PR y GitHub Issues Sync.
- Vercel:
  conectar el repo, dejar `main` como Production Branch y usar previews para PRs y ramas.
- GitHub:
  proteger `main` y `develop`, exigir review y checks obligatorios.
  configurar el secret `GH_PROJECT_TOKEN` para que el workflow `Project Mirror` pueda actualizar el GitHub Project.
  configurar `LINEAR_API_KEY` si querés que el mirror tome el estado de Linear cuando encuentre el `CRIS-###`.

## GitHub Project y milestones
- El GitHub Project refleja ejecución y review en GitHub; Linear sigue siendo la fuente de verdad para planificación.
- Los milestones de GitHub se reservan para releases y deben usar nombres versionados, por ejemplo `v0.1.0`.
- Los cycles siguen viviendo en Linear y no deben mapearse 1:1 a milestones de GitHub.

## Versionado y releases
- `package.json` es la fuente de verdad de la versión.
- Usar:
  - `npm run version:patch`
  - `npm run version:minor`
  - `npm run version:major`
- Los workflows usan `github.token`; no necesitan un PAT adicional para tags y releases.
- Cuando una PR con bump de versión se mergea a `develop`, el workflow `Prerelease` publica `vX.Y.Z-rc.N`.
- Cuando esa versión llega a `main`, el workflow `Release` publica `vX.Y.Z`.
- No hacer tags manuales para releases normales salvo que haya una excepción operacional.
