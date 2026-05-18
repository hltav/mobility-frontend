import { z } from 'zod';

export const RealTimeBusSchema = z.object({
  prefix: z.string(),
  lat: z.number(),
  lng: z.number(),
  status: z.enum(['moving', 'stopped']).optional().default('moving'),
});

export type RealTimeBus = z.infer<typeof RealTimeBusSchema>;
