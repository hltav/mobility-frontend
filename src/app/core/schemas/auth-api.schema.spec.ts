import { AuthApiResponseSchema } from './auth-api.schema';
import { LoginRequestSchema, RegisterRequestSchema } from './auth.schema';
import { mapAuthResponse } from '../mappers/auth.mapper';

// Synthetic attributes matching the User/JsonResponse serialization verified without a database.
const registration = () => ({
  message: 'Usuário criado com sucesso.',
  data: {
    token: 'synthetic-contract-token',
    user: {
      id: 17,
      name: 'Pessoa de contrato',
      email: 'contract@example.invalid',
      created_at: '2026-10-24T12:00:00.000000Z',
      updated_at: '2026-10-24T12:00:00.000000Z',
    },
  },
});

describe('Laravel login and registration contracts', () => {
  it('accepts a registration response that omits nullable profile attributes', () => {
    const payload = registration();
    expect(AuthApiResponseSchema.parse(payload)).toEqual(payload);
    expect(mapAuthResponse(payload)).toEqual({
      token: payload.data.token,
      user: {
        id: 17,
        name: 'Pessoa de contrato',
        email: 'contract@example.invalid',
      },
    });
  });

  it('accepts a login response with explicitly null profile attributes', () => {
    const payload = registration();
    const login = {
      ...payload,
      message: 'Login realizado com sucesso.',
      data: {
        ...payload.data,
        user: {
          ...payload.data.user,
          avatar: null,
          google_id: null,
          email_verified_at: null,
        },
      },
    };
    expect(AuthApiResponseSchema.parse(login)).toEqual(login);
    expect(mapAuthResponse(login).token).toBe(payload.data.token);
  });

  it('preserves optional string attributes without exposing them in the session adapter', () => {
    const payload = registration();
    const complete = {
      ...payload,
      data: {
        ...payload.data,
        user: {
          ...payload.data.user,
          avatar: 'https://example.invalid/avatar.png',
          google_id: 'synthetic-id',
          email_verified_at: '2026-10-24T12:00:00.000000Z',
        },
      },
    };
    expect(AuthApiResponseSchema.parse(complete)).toEqual(complete);
    expect(mapAuthResponse(complete).user).toEqual({
      id: 17,
      name: 'Pessoa de contrato',
      email: 'contract@example.invalid',
    });
  });

  it.each(['avatar', 'google_id', 'email_verified_at'])(
    'rejects an invalid supplied %s',
    (field) => {
      const payload = registration();
      expect(
        AuthApiResponseSchema.safeParse({
          ...payload,
          data: {
            ...payload.data,
            user: { ...payload.data.user, [field]: 42 },
          },
        }).success,
      ).toBe(false);
    },
  );

  it.each(['id', 'name', 'email', 'created_at', 'updated_at'])(
    'still requires user.%s',
    (field) => {
      const payload = registration();
      const user: Record<string, unknown> = { ...payload.data.user };
      delete user[field];
      expect(
        AuthApiResponseSchema.safeParse({
          ...payload,
          data: { ...payload.data, user },
        }).success,
      ).toBe(false);
    },
  );

  it('still rejects missing envelope fields, token or user and malformed email', () => {
    const payload = registration();
    for (const invalid of [
      { data: payload.data },
      { message: payload.message },
      { ...payload, data: { user: payload.data.user } },
      { ...payload, data: { token: payload.data.token } },
      { ...payload, data: { ...payload.data, token: null } },
      {
        ...payload,
        data: {
          ...payload.data,
          user: { ...payload.data.user, email: 'invalid-email' },
        },
      },
    ])
      expect(AuthApiResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it('preserves login email/password limits matching Laravel LoginRequest', () => {
    expect(
      LoginRequestSchema.parse({
        email: ' contract@example.invalid ',
        password: 'abcdef',
      }).email,
    ).toBe('contract@example.invalid');
    for (const credentials of [
      { email: 'invalid', password: 'abcdef' },
      { email: 'contract@example.invalid', password: 'abcde' },
      { email: 'contract@example.invalid', password: 'a'.repeat(101) },
      { email: `${'a'.repeat(250)}@example.invalid`, password: 'abcdef' },
    ])
      expect(LoginRequestSchema.safeParse(credentials).success).toBe(false);
  });

  it('preserves register name, password and confirmation requirements', () => {
    const request = {
      name: 'Pessoa de contrato',
      email: 'contract@example.invalid',
      password: 'abcdef',
      password_confirmation: 'abcdef',
    };
    expect(RegisterRequestSchema.safeParse(request).success).toBe(true);
    for (const invalid of [
      { ...request, name: 'ab' },
      { ...request, name: 'a'.repeat(101) },
      { ...request, password_confirmation: 'different' },
      { ...request, password: 'abcde', password_confirmation: 'abcde' },
    ])
      expect(RegisterRequestSchema.safeParse(invalid).success).toBe(false);
  });
});
