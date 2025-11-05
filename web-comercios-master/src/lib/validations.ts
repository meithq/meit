import { z } from 'zod'
import { VALIDATION, CHALLENGE_TYPES } from './constants'

/**
 * Customer validation schema
 */
export const customerSchema = z.object({
  phone: z
    .string({ message: 'El teléfono es requerido' })
    .min(1, 'El teléfono es requerido')
    .regex(VALIDATION.PHONE_REGEX, `Formato inválido. Use: ${VALIDATION.PHONE_FORMAT}`),
  name: z
    .string({ message: 'El nombre es requerido' })
    .min(VALIDATION.MIN_NAME_LENGTH, `Mínimo ${VALIDATION.MIN_NAME_LENGTH} caracteres`)
    .max(VALIDATION.MAX_NAME_LENGTH, `Máximo ${VALIDATION.MAX_NAME_LENGTH} caracteres`)
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
})

export type CustomerFormData = z.infer<typeof customerSchema>

/**
 * Challenge validation schema
 */
export const challengeSchema = z.object({
  name: z
    .string({ message: 'El nombre es requerido' })
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(VALIDATION.MAX_DESCRIPTION_LENGTH, `Máximo ${VALIDATION.MAX_DESCRIPTION_LENGTH} caracteres`)
    .optional()
    .or(z.literal('')),
  type: z.enum([
    CHALLENGE_TYPES.AMOUNT_MIN,
    CHALLENGE_TYPES.TIME_BASED,
    CHALLENGE_TYPES.FREQUENCY,
    CHALLENGE_TYPES.CATEGORY,
  ] as const, { message: 'Tipo de reto inválido' }),
  points: z
    .number({ message: 'Los puntos deben ser un número' })
    .min(1, 'Mínimo 1 punto')
    .max(1000, 'Máximo 1000 puntos')
    .int('Los puntos deben ser un número entero'),
  target_value: z
    .number({ message: 'El valor objetivo debe ser un número' })
    .min(0, 'El valor objetivo debe ser mayor o igual a 0')
    .optional(),
  is_active: z.boolean().default(true),
})

export type ChallengeFormData = z.infer<typeof challengeSchema>

/**
 * Gift card code validation schema
 */
export const giftCardSchema = z.object({
  code: z
    .string({ message: 'El código es requerido' })
    .length(VALIDATION.GIFT_CARD_CODE_LENGTH, `El código debe tener ${VALIDATION.GIFT_CARD_CODE_LENGTH} caracteres`)
    .regex(VALIDATION.GIFT_CARD_CODE_REGEX, 'El código debe contener solo letras mayúsculas y números'),
})

export type GiftCardValidation = z.infer<typeof giftCardSchema>

/**
 * Gift card configuration validation schema
 */
export const giftCardConfigSchema = z.object({
  points_required: z
    .number({ message: 'Los puntos requeridos deben ser un número' })
    .min(50, 'Mínimo 50 puntos')
    .max(500, 'Máximo 500 puntos')
    .int('Debe ser un número entero'),
  value: z
    .number({ message: 'El valor debe ser un número' })
    .min(2, 'Mínimo $2 USD')
    .max(25, 'Máximo $25 USD'),
  expiration_days: z
    .number({ message: 'Los días de vencimiento deben ser un número' })
    .min(7, 'Mínimo 7 días')
    .max(90, 'Máximo 90 días')
    .int('Debe ser un número entero'),
  max_active_per_customer: z
    .number({ message: 'El máximo de gift cards activas debe ser un número' })
    .min(1, 'Mínimo 1 gift card')
    .max(10, 'Máximo 10 gift cards')
    .int('Debe ser un número entero'),
})

export type GiftCardConfigFormData = z.infer<typeof giftCardConfigSchema>

/**
 * Points transaction validation schema
 */
export const pointsTransactionSchema = z.object({
  customer_id: z.string({ message: 'El ID de cliente es requerido' }).uuid('ID de cliente inválido'),
  points: z
    .number({ message: 'Los puntos deben ser un número' })
    .int('Los puntos deben ser un número entero'),
  type: z.enum(['earn', 'redeem', 'adjustment'] as const),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type PointsTransactionFormData = z.infer<typeof pointsTransactionSchema>

/**
 * Branch validation schema
 */
export const branchSchema = z.object({
  name: z
    .string({ message: 'El nombre es requerido' })
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  address: z
    .string()
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
})

export type BranchFormData = z.infer<typeof branchSchema>

/**
 * Merchant settings validation schema
 */
export const merchantSettingsSchema = z.object({
  name: z
    .string({ message: 'El nombre es requerido' })
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  business_category: z
    .string()
    .max(50, 'Máximo 50 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(VALIDATION.PHONE_REGEX, `Formato inválido. Use: ${VALIDATION.PHONE_FORMAT}`)
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  points_per_bs: z
    .number({ message: 'Los puntos por bolívar deben ser un número' })
    .min(1, 'Mínimo 1 punto por bolívar')
    .max(100, 'Máximo 100 puntos por bolívar')
    .int('Debe ser un número entero'),
})

export type MerchantSettingsFormData = z.infer<typeof merchantSettingsSchema>

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'El email es requerido' })
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string({ message: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Registration validation schema
 */
export const registerSchema = z.object({
  email: z
    .string({ message: 'El email es requerido' })
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string({ message: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres'),
  confirm_password: z
    .string({ message: 'Confirma tu contraseña' })
    .min(1, 'Confirma tu contraseña'),
  name: z
    .string({ message: 'El nombre es requerido' })
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  merchant_name: z
    .string({ message: 'El nombre del comercio es requerido' })
    .min(1, 'El nombre del comercio es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Phone validation helper
 */
export function validatePhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone)
}

/**
 * Email validation helper
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Gift card code validation helper
 */
export function validateGiftCardCode(code: string): boolean {
  return VALIDATION.GIFT_CARD_CODE_REGEX.test(code)
}
