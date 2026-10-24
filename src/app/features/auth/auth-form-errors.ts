import { HttpErrorResponse } from '@angular/common/http';
export function authFailure(error: unknown): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return {
        message: 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
        fields,
      };
    if (error.status === 422 && error.error?.errors && typeof error.error.errors === 'object') {
      for (const [key, messages] of Object.entries(error.error.errors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') fields[key] = messages[0];
      }
    }
    return {
      message:
        error.status === 401
          ? 'E-mail ou senha incorretos.'
          : error.status === 422
            ? 'Confira os campos indicados e tente novamente.'
            : 'Não foi possível concluir. Tente novamente em alguns instantes.',
      fields,
    };
  }
  return { message: 'Não foi possível validar a resposta. Tente novamente.', fields };
}
