/**
 * Application-wide constants for MEIT platform
 */

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/dashboard/customers',
  CUSTOMER_DETAIL: (id: string) => `/dashboard/customers/${id}`,
  POS: '/dashboard/pos',
  CHALLENGES: '/dashboard/challenges',
  GIFT_CARDS: '/dashboard/gift-cards',
  ANALYTICS: '/dashboard/analytics',
  SETTINGS: '/dashboard/settings',
  ONBOARDING: '/onboarding',
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// Points configuration
export const POINTS = {
  MIN_POINTS_PER_BS: 1,
  MAX_POINTS_PER_BS: 100,
  DEFAULT_POINTS_PER_BS: 10,
  GIFT_CARD_THRESHOLD: 1000,
} as const

// Validation patterns and rules
export const VALIDATION = {
  PHONE_REGEX: /^\+58[0-9]{10}$/,
  PHONE_FORMAT: '+58 XXX-XXX-XXXX',
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  GIFT_CARD_CODE_LENGTH: 8,
  GIFT_CARD_CODE_REGEX: /^[A-Z0-9]{8}$/,
} as const

// Date formats (using date-fns format strings)
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const

// Challenge types
export const CHALLENGE_TYPES = {
  AMOUNT_MIN: 'amount_min',
  TIME_BASED: 'time_based',
  FREQUENCY: 'frequency',
  CATEGORY: 'category',
} as const

export const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  [CHALLENGE_TYPES.AMOUNT_MIN]: 'Monto mínimo',
  [CHALLENGE_TYPES.TIME_BASED]: 'Basado en tiempo',
  [CHALLENGE_TYPES.FREQUENCY]: 'Frecuencia de visitas',
  [CHALLENGE_TYPES.CATEGORY]: 'Por categoría',
} as const

// Gift card statuses
export const GIFT_CARD_STATUS = {
  AVAILABLE: 'available',
  REDEEMED: 'redeemed',
  EXPIRED: 'expired',
} as const

export const GIFT_CARD_STATUS_LABELS: Record<string, string> = {
  [GIFT_CARD_STATUS.AVAILABLE]: 'Disponible',
  [GIFT_CARD_STATUS.REDEEMED]: 'Canjeada',
  [GIFT_CARD_STATUS.EXPIRED]: 'Expirada',
} as const

// Point transaction types
export const POINT_TRANSACTION_TYPES = {
  EARN: 'earn',
  REDEEM: 'redeem',
  ADJUSTMENT: 'adjustment',
} as const

export const POINT_TRANSACTION_TYPE_LABELS: Record<string, string> = {
  [POINT_TRANSACTION_TYPES.EARN]: 'Ganados',
  [POINT_TRANSACTION_TYPES.REDEEM]: 'Canjeados',
  [POINT_TRANSACTION_TYPES.ADJUSTMENT]: 'Ajuste',
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
} as const

export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.OPERATOR]: 'Operador',
} as const

// Sort orders
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_STATE: 'meit-auth-state',
  THEME: 'meit-theme',
  LAST_MERCHANT_ID: 'meit-last-merchant-id',
} as const

// Session timeouts (in milliseconds)
export const SESSION = {
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const

// API timeouts (in milliseconds)
export const API = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  POS_TIMEOUT: 5000, // 5 seconds for POS operations
  UPLOAD_TIMEOUT: 30000, // 30 seconds for uploads
} as const

// Venezuelan phone format
export const PHONE = {
  COUNTRY_CODE: '+58',
  AREA_CODE_LENGTH: 3,
  NUMBER_LENGTH: 7,
  TOTAL_LENGTH: 10, // excluding country code
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No tienes permisos para esta acción.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  GENERIC_ERROR: 'Ocurrió un error. Por favor intenta nuevamente.',
  CUSTOMER_NOT_FOUND: 'Cliente no encontrado.',
  INVALID_PHONE: 'Formato de teléfono inválido.',
  INVALID_EMAIL: 'Formato de email inválido.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  CUSTOMER_CREATED: 'Cliente creado exitosamente.',
  CUSTOMER_UPDATED: 'Cliente actualizado exitosamente.',
  CHALLENGE_CREATED: 'Reto creado exitosamente.',
  CHALLENGE_UPDATED: 'Reto actualizado exitosamente.',
  GIFT_CARD_REDEEMED: 'Gift card canjeada exitosamente.',
  POINTS_ADDED: 'Puntos agregados exitosamente.',
} as const
