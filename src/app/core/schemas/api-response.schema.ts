import * as z from 'zod';

export const ApiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    message: z.string(),
    data: schema,
    status: z.number().optional(),
  });

export type ApiResponse<T> = {
  message: string;
  data: T;
  status?: number;
};
