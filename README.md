# ATL Fichas Clientes

Sistema de fichas de clientes de **AthleteTrainLab** (onboarding, app del cliente y panel del coach).

## Arquitectura

- **Backend:** Supabase, dentro del proyecto existente **ATL Analytics** (`wmmfsblgrusvbaugcihp`) — no fue posible crear proyecto nuevo por el límite de 2 proyectos del plan gratuito. Todo lo de fichas usa el prefijo `fichas_` y buckets `fichas-*`, separado del resto.
- **Correos:** Brevo, remitente `AthleteTrainLab <hola@athletetrainlab.com>`. La API key vive en el Vault (`get_secret('BREVO_API_KEY')`) y también como secret de Edge Functions del proyecto.
- **Frontend:** HTML/JS estático mobile-first, publicado con GitHub Pages.

## Flujo

1. El coach envía el link de `onboarding.html` por WhatsApp.
2. El cliente llena su ficha (datos, foto con cámara, disciplinas, salud, rodillo, objetivo, disponibilidad semanal).
3. La Edge Function `fichas-onboarding` crea el usuario con contraseña autogenerada y envía por Brevo las credenciales + link de confirmación.
4. Al confirmar (`fichas-confirmar`), la cuenta se activa y **fecha de pago = ese día** (`fecha_pago` y `proximo_pago`).
5. El cliente entra a `app.html`: perfil, evaluaciones y registro de pago con comprobante.
6. Barra de estado: **verde** al día · **amarillo** a ≤5 días del pago o comprobante en revisión · **rojo** vencido (con recordatorio diario por correo vía pg_cron, máx. uno cada 3 días).
7. El coach (`coach.html`): ve fichas, asigna tarifa (₡ por cliente), aprueba/rechaza comprobantes (aprobar avanza la fecha de pago +1 mes y avisa por correo) y sube evaluaciones.

## Estados del onboarding

`espera_prueba` → `pendiente_evaluacion` → `evaluacion_completada` → `completado`

1. **espera_prueba**: estado inicial al enviar la ficha.
2. El coach agenda la prueba (fecha + hora + nota) en el panel → correo con la cita y el link de la **evaluación perceptiva** (configurable en `fichas_config`) → pasa a **pendiente_evaluacion** automáticamente.
3. Hecha la prueba, el coach sube los resultados en Evaluaciones y marca **evaluación completada** → correo con: acceso a la app (registro de pagos), links configurables (chat ATL, recursos de alimentación, los que se agreguen) y botón **Completar mi onboarding**.
4. El botón lleva a `completar.html`, donde el cliente deja un mensaje de mejora (o lo omite) → estado **completado**. El mensaje se ve en el panel del coach.

El cliente sigue su progreso con el stepper en la pestaña Perfil de `app.html`. Los correos de cita/recursos se disparan por triggers de BD (`fichas_onboarding_notifica`) vía `pg_net` → `fichas-notificar`. Los links de los correos se editan en el panel del coach (tabla `fichas_config`).

## Evaluaciones de limitaciones (quiz perceptivo)

El quiz (repo `ATLKSYS`, tabla `evaluaciones`) queda ligado a la ficha del cliente mediante el parámetro **`?atl=<cliente_id>`** en el link: el quiz lo lee y guarda `evaluaciones.cliente_id` al enviar. Sin parámetro (leads externos) la evaluación queda sin ligar, como siempre.

- El correo de la cita envía automáticamente el link personalizado.
- En el panel del coach, cada cliente tiene la sección **Análisis de limitaciones** con el historial y un botón para copiar el link personalizado (para evaluaciones periódicas: inicio, después de entrenos fuertes o carreras).

## Trabajo de fuerza

Campo único `fuerza` en la ficha: gym con ayuda de programación / gym por su cuenta / funcionales en casa / no por ahora. El correo final de onboarding incluye el contacto de **Susan Camacho** (+506 7143 2592, WhatsApp), personalizado si el cliente pidió ayuda.

## Componentes en Supabase

| Pieza | Nombre |
|---|---|
| Tablas | `fichas_clientes`, `fichas_disponibilidad`, `fichas_evaluaciones`, `fichas_pagos`, `fichas_coaches`, `fichas_config` (todas con RLS) |
| Buckets privados | `fichas-fotos`, `fichas-comprobantes`, `fichas-evaluaciones` (rutas `{user_id}/...`) |
| Edge Functions | `fichas-onboarding`, `fichas-confirmar`, `fichas-feedback`, `fichas-notificar` (protegida con header `x-atl-secret`) |
| Vault | `BREVO_API_KEY`, `FROM_EMAIL`, `ATL_CRON_SECRET` (función `public.get_secret`, solo service_role) |
| Cron | `fichas-recordatorios-diarios` a las 14:00 UTC (8:00 am CR) |

## Agregar otro coach

Desde el SQL editor de Supabase:

```sql
select net.http_post(
  url := 'https://wmmfsblgrusvbaugcihp.supabase.co/functions/v1/fichas-notificar',
  headers := jsonb_build_object('Content-Type','application/json','x-atl-secret', public.get_secret('ATL_CRON_SECRET')),
  body := jsonb_build_object('action','crear_coach','email','correo@ejemplo.com','nombre','Nombre Apellido')
);
```

Las credenciales le llegan por correo.

## Pendientes

- [ ] **Recuperación de contraseña:** usa el correo integrado de Supabase (limitado a ~2/hora y remitente genérico). Configurar en el dashboard: Authentication → URL Configuration → Site URL = URL de GitHub Pages, y agregar `.../clave.html` a Redirect URLs. Ideal: SMTP de Brevo en Authentication → SMTP Settings.
- [ ] Mover el sistema a un proyecto Supabase propio si se libera espacio o se pasa a plan Pro.
- [ ] RLS deshabilitado en las tablas de analytics preexistentes (`athletes`, `workouts`, etc.) — advertencia de seguridad de Supabase, no pertenece a fichas pero conviene resolverla.
- [ ] Borrar/limpiar tablas de proyectos anteriores en ATL Analytics (backlog acordado).
- [ ] Recordatorio automático al cliente el día antes de la prueba (hoy solo el correo al agendar).
- [ ] Notificación al coach cuando un cliente sube un comprobante (hoy se ve en el panel).
- [ ] Bloqueo/aviso al cliente con varios meses de atraso (hoy solo barra roja + recordatorios).
- [ ] Editar la ficha desde la app del cliente (hoy solo lectura; el coach puede editar en BD).
- [ ] Dominio propio (ej. `fichas.athletetrainlab.com`) apuntando a GitHub Pages.

## Desarrollo

Sitio estático sin build. `assets/config.js` tiene la URL del proyecto y la publishable key (pública por diseño; la seguridad la da RLS).
