// URL del backend: en desarrollo usa el preview de Emergent, en producción SIEMPRE el VPS permanente
export const BACKEND_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_BACKEND_URL || '')
  : 'https://heimdall.escudolegado.com';
