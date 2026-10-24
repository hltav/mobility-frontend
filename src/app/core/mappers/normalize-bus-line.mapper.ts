import z from 'zod';
import { BusLine, BusLineSchema } from '../schemas/bus-line.schema';

const BusLineDtoSchema = z.object({
  id: z.number().optional(),
  sptrans_id: z.number(),
  code: z.string(),
  name: z.string(),
  direction: BusLineSchema.shape.direction,
  origin: z.string(),
  destination: z.string(),
  variants: z.array(z.unknown()).optional(),
  isFavorite: z.boolean().optional(),
});

export const normalizeBusLine = (item: unknown): BusLine => {
  const dto = BusLineDtoSchema.parse(item);

  return BusLineSchema.parse({
    id: dto.id ?? dto.sptrans_id,
    database_id: dto.id ?? null,
    sptrans_id: dto.sptrans_id,
    code: dto.code,
    name: dto.name,
    direction: dto.direction,
    origin: dto.origin,
    destination: dto.destination,
    variants: dto.variants ?? [],
    isFavorite: dto.isFavorite ?? false,
  });
};
