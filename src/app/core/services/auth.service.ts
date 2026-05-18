import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { mapAuthResponse } from '../mappers/auth.mapper';
import { AuthResponseSchema, LoginRequest, RegisterRequest } from '../schemas/auth.schema';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  isAuthenticated = signal<boolean>(this.hasToken());

  login(credentials: LoginRequest) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => {
        const normalized = mapAuthResponse(response);

        this.saveAuthData(normalized);

        return normalized;
      }),
    );
  }

  register(userData: RegisterRequest) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => this.clearAuth(),
        error: () => this.clearAuth(),
      });
    } else {
      this.clearAuth();
    }
  }

  saveAuthData(response: unknown) {
    const validated = AuthResponseSchema.parse(response);
    localStorage.setItem('auth_token', validated.token);
    localStorage.setItem('user', JSON.stringify(validated.user));
    this.isAuthenticated.set(true);
  }

  private clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
