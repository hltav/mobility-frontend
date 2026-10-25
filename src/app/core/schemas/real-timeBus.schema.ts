import * as z from 'zod';

export const RealTimeBusSchema = z
  .object({
    prefix: z.string(),
    plate: z.string().nullable().optional().catch(undefined),
    speed_kmh: z
      .preprocess(
        (value) => (typeof value === 'string' && !value.trim() ? undefined : value),
        z.coerce.number().nonnegative().nullable().optional(),
      )
      .catch(undefined),
    observed_at: z.string().datetime({ offset: true }).nullable().optional().catch(undefined),
    accessible: z.boolean().optional().default(false),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    status: z.enum(['moving', 'stopped']).optional().default('moving'),
  })
  .transform((bus, ctx) => {
    const lat = bus.lat ?? bus.latitude;
    const lng = bus.lng ?? bus.longitude;

    if (lat === undefined || lng === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordenadas do ônibus ausentes.',
      });

      return z.NEVER;
    }

    return {
      prefix: bus.prefix,
      accessible: bus.accessible,
      lat,
      lng,
      status: bus.status,
      ...(bus.plate ? { plate: bus.plate } : {}),
      ...(bus.speed_kmh != null ? { speed_kmh: bus.speed_kmh } : {}),
      ...(bus.observed_at ? { observed_at: bus.observed_at } : {}),
    };
  });

export type RealTimeBus = z.infer<typeof RealTimeBusSchema>;
