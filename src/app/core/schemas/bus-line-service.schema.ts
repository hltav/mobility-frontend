import * as z from 'zod';
import { NearbyOriginSchema } from './nearby-response.schema';

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
}

export interface LineStop {
  code?: string;
  scheduled_time?: string;
  line_codes?: string[];
  id?: number | null;
  sptrans_id?: number | null;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export const NearbyResponseDtoSchema = z.object({
  origin: NearbyOriginSchema.nullable(),
  lines: z.array(
    z
      .object({
        distance_km: z.coerce.number(),
      })
      .passthrough(),
  ),
});

const StopLineDtoSchema = z
  .object({
    id: z.number().optional(),
    sptrans_id: z.number().optional(),
    code: z.string(),
    name: z.string(),
    origin: z.string(),
    destination: z.string(),
    circular: z.boolean().optional().default(false),
    origin_lat: z.number().nullable().optional(),
    origin_lng: z.number().nullable().optional(),
  })
  .passthrough();

export const TripNearestResponseSchema = z.object({
  origin: z.object({
    point: z.unknown().nullable(),
    stops: z.array(
      z
        .object({
          lines: z.array(StopLineDtoSchema).optional().default([]),
        })
        .passthrough(),
    ),
  }),
  destination: z.object({
    point: z.unknown().nullable(),
    stops: z.array(
      z
        .object({
          lines: z.array(StopLineDtoSchema).optional().default([]),
        })
        .passthrough(),
    ),
  }),
});

export const LineStopSchema = z
  .object({
    code: z.string().optional(),
    scheduled_time: z.string().optional(),
    line_codes: z.array(z.string()).optional(),
    id: z.number().nullable().optional(),
    sptrans_id: z.number().nullable().optional(),
    sptrans_code: z.number().nullable().optional(),
    name: z.string().optional().default(''),
    np: z.string().optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    py: z.coerce.number().optional(),
    px: z.coerce.number().optional(),
    order: z.coerce.number().optional(),
  })
  .transform((stop, ctx) => {
    const lat = stop.lat ?? stop.latitude ?? stop.py;
    const lng = stop.lng ?? stop.longitude ?? stop.px;

    if (lat === undefined || lng === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coordenadas da parada ausentes.',
      });

      return z.NEVER;
    }

    return {
      ...(stop.code ? { code: stop.code } : {}),
      ...(stop.scheduled_time ? { scheduled_time: stop.scheduled_time } : {}),
      ...(stop.line_codes ? { line_codes: stop.line_codes } : {}),
      id: stop.id,
      sptrans_id: stop.sptrans_id ?? stop.sptrans_code,
      name: stop.name || stop.np || '',
      lat,
      lng,
      order: stop.order ?? 0,
    };
  });

export const LineStopsResponseSchema = z.object({
  stops: z.array(LineStopSchema),
});
