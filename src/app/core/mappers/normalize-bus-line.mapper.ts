import z from 'zod';
import { BusLine, BusLineSchema } from '../schemas/bus-line.schema';

const BusLineDtoSchema = z.object({
  sptrans_id: z.number(),
  code: z.string(),
  name: z.string(),
  origin: z.string(),
  destination: z.string(),
  variants: z.array(z.unknown()).optional(),
  isFavorite: z.boolean().optional(),
});

export const normalizeBusLine = (item: unknown): BusLine => {
  const dto = BusLineDtoSchema.parse(item);

  return BusLineSchema.parse({
    id: dto.sptrans_id,
    code: dto.code,
    name: dto.name,
    origin: dto.origin,
    destination: dto.destination,
    variants: dto.variants ?? [],
    isFavorite: dto.isFavorite ?? false,
  });
};
