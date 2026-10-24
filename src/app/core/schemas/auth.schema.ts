import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.').max(255),
  password: z.string().min(6, 'Use pelo menos 6 caracteres.').max(100),
});

export const RegisterRequestSchema = z
  .object({
    name: z.string().trim().min(3, 'Informe seu nome com pelo menos 3 caracteres.').max(100),
    email: z.string().trim().email('Informe um e-mail válido.').max(255),
    password: z.string().min(6, 'Use pelo menos 6 caracteres.').max(100),
    password_confirmation: z.string().min(6, 'Confirme sua senha.').max(100),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'As senhas não coincidem.',
  });

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
  token: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
