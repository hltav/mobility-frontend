import { AuthApiResponseSchema } from '../schemas/auth-api.schema';
import { AuthResponseSchema } from '../schemas/auth.schema';

export function mapAuthResponse(input: unknown) {
  const api = AuthApiResponseSchema.parse(input);

  return AuthResponseSchema.parse({
    token: api.data.token,
    user: {
      id: api.data.user.id,
      name: api.data.user.name,
      email: api.data.user.email,
    },
  });
}
