# Frontend environment

Variables publicas usadas por Expo:

- `EXPO_PUBLIC_API_URL`: URL publica de la API. Si no se define, la app conserva la URL actual configurada en `src/constants/api.ts`.
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: clave publica de Stripe (`pk_...`). No usar claves secretas en la app.
- `EXPO_PUBLIC_ENABLE_WS_DEBUG`: `true` o `1` solo en development para mostrar diagnostico de WebSocket.

Entornos sugeridos:

- development: API local o de pruebas, Stripe publishable key de pruebas, debug opcional.
- preview/staging: API de staging, Stripe publishable key de pruebas, debug desactivado.
- production: API productiva, Stripe publishable key productiva, debug desactivado.

Pendiente antes de compilar produccion:

- Confirmar identificadores finales de Android/iOS.
- Confirmar icono y splash definitivos.
- Confirmar URL productiva y configuracion de Stripe publica.
- Validar permisos de camara y galeria en dispositivos reales.
