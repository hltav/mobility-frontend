import * as z from 'zod';

export const AuthApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
      avatar: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
      email_verified_at: z.string().nullable(),
      google_id: z.string().nullable(),
    }),
  }),
});

export type AuthApiResponse = z.infer<typeof AuthApiResponseSchema>;
