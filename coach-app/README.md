# ATL Coach (app del coach)

Versión reducida del panel de coach para el iPhone: **alertas críticas**, **próximos eventos** y **chat** con clientes.
Proyecto totalmente separado de la app de clientes (`../app.html`, `../ios/`): carpeta, bundle ID y tokens de push propios.
Usa el mismo proyecto Supabase (`cejgurbaweucfpuzvdpw`) y las mismas políticas RLS que `coach.html`.

- Bundle ID: `com.athletetrainlab.coach`  ·  Nombre: **ATL Coach**
- Solo entran cuentas que existan en `fichas_coaches` (si entra un cliente, se cierra su sesión).

## Primera vez (en tu Mac, dentro de `coach-app/`)

```bash
npm install
npm run build:www
npx cap add ios        # crea coach-app/ios
npm run sync:ios
npm run open:ios       # abre Xcode
```

En Xcode (target **App**):
1. *Signing & Capabilities* → tu Team, Bundle Identifier `com.athletetrainlab.coach`.
2. **+ Capability → Push Notifications** (y *Background Modes → Remote notifications* es opcional).
3. En el Apple Developer portal, el App ID `com.athletetrainlab.coach` debe tener Push Notifications activado
   (Xcode con "Automatically manage signing" lo hace solo). La **misma llave .p8** de APNs que ya usas sirve para las dos apps.
4. Ícono: agrega tu ícono en `ios/App/App/Assets.xcassets/AppIcon`.
5. Versión: `MARKETING_VERSION` 1.0, build 1.

## Push al coach (ya configurado en Supabase)

- Tabla `fichas_coach_push_tokens` (RLS: cada coach gestiona solo sus tokens).
- Triggers: mensaje nuevo de un cliente → push a los coaches responsables (supers + entrenadores asignados);
  alerta crítica nueva → push a los mismos.
- La Edge Function `send-push` acepta `coach_user_id` y usa el secret `APNS_COACH_BUNDLE_ID`
  (por defecto `com.athletetrainlab.coach`, no hace falta crearlo).
- Igual que en la app de clientes: si el aviso de permiso no aparece, activa las notificaciones en
  Ajustes → ATL Coach → Notificaciones y reabre la app.

## Cuando cambies el código web

```bash
npm run sync:ios   # copia index.html, app.html, assets/ a www/ y sincroniza iOS
```

## Estructura

```
coach-app/
  index.html        login (valida que sea coach)
  app.html          Inicio (alertas + eventos) y Chats (bandeja + hilo)
  assets/config.js  Supabase + logo
  assets/coach.css  estilos (tema oscuro)
  scripts/build-www.js, capacitor.config.json, package.json
```
