// Esquemas zod compartidos: el formulario (cliente) y la API (servidor) validan
// con las mismas reglas, así un dato inválido nunca llega a la base de datos.
import * as z from 'zod';
import { isReasonValidFor, REASON_VALUES } from '@/lib/reasons';

// Mensajes por defecto de zod en español (p. ej. campos faltantes en una
// solicitud hecha directamente a la API); los mensajes propios tienen prioridad.
z.config(z.locales.es());

// Mensaje cuando el cuerpo de la solicitud no es un objeto JSON.
const INVALID_BODY = { error: 'Datos inválidos' };

export const loginSchema = z.object({
  email: z.email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
}, INVALID_BODY);

export const employeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre debe tener como máximo 80 caracteres'),
  // z.coerce acepta el valor como texto (inputs HTML) y lo convierte a número.
  initialBalance: z.coerce
    .number<string | number>('El saldo inicial debe ser un número')
    .int('El saldo inicial debe ser un número entero de horas')
    .min(0, 'El saldo inicial no puede ser negativo')
    .max(10000, 'El saldo inicial no puede superar 10000 horas'),
}, INVALID_BODY);

export const movementSchema = z
  .object(
    {
      employeeId: z.string().min(1, 'Selecciona un empleado'),
      type: z.enum(['ENTRADA', 'SALIDA'], 'Selecciona el tipo de movimiento'),
      quantity: z.coerce
        .number<string | number>('La cantidad debe ser un número')
        .int('La cantidad debe ser un número entero de horas')
        .min(1, 'La cantidad debe ser un número entero mayor que cero')
        .max(1000, 'La cantidad no puede superar 1000 horas'),
      // Justificación obligatoria: motivo de una lista cerrada + descripción libre.
      reason: z.enum(REASON_VALUES, 'Selecciona el motivo del movimiento'),
      description: z
        .string('Describe el movimiento (mínimo 3 caracteres)')
        .trim()
        .min(3, 'Describe el movimiento (mínimo 3 caracteres)')
        .max(200, 'La descripción debe tener como máximo 200 caracteres'),
    },
    INVALID_BODY
  )
  // El motivo debe corresponder al tipo (p. ej., una cita médica no puede ser una entrada).
  .refine((data) => isReasonValidFor(data.type, data.reason), {
    message: 'El motivo no corresponde al tipo de movimiento',
    path: ['reason'],
  });

export const roleSchema = z.object({
  role: z.enum(['ADMIN', 'USER'], 'Selecciona un rol válido'),
}, INVALID_BODY);

export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type MovementInput = z.infer<typeof movementSchema>;
export type RoleInput = z.infer<typeof roleSchema>;

/** Primer mensaje de error de un resultado de zod, para responder en la API. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos inválidos';
}
