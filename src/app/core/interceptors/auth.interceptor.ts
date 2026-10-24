import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { DOCUMENT } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const base = inject(DOCUMENT).baseURI;
  const api = new URL(environment.apiUrl, base);
  const target = new URL(req.url, base);
  const apiPath = api.pathname.replace(/\/$/, '');
  const ownApi =
    target.origin === api.origin &&
    (target.pathname === apiPath || target.pathname.startsWith(apiPath + '/'));
  if (!ownApi) return next(req);
  const publicAuth = [`${apiPath}/auth/login`, `${apiPath}/auth/register`].includes(
    target.pathname,
  );

  const token = authService.getToken();

  const authReq =
    token && !publicAuth
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !publicAuth) {
        authService.invalidateSession();
      }

      return throwError(() => error);
    }),
  );
};
