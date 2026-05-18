import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center">
      <div
        class="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700"
      >
        <div class="text-center mb-8">
          <div class="inline-block bg-blue-600 p-3 rounded-2xl text-white mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"
              />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Crie sua conta</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2">Comece a usar o MobilityGo</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome Completo</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="exemplo@email.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Confirmar Senha</label>
            <input
              type="password"
              [(ngModel)]="passwordConfirmation"
              name="password_confirmation"
              required
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <span
              *ngIf="isLoading()"
              class="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"
            ></span>
            Cadastrar
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-slate-500">Já possui conta?</span>
          <a routerLink="/login" class="ml-1 text-blue-600 font-semibold hover:underline"
            >Fazer login</a
          >
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  isLoading = signal(false);

  onSubmit() {
    if (this.password !== this.passwordConfirmation) {
      this.toastService.show('As senhas não coincidem', 'error');
      return;
    }

    this.isLoading.set(true);
    this.authService
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation,
      })
      .subscribe({
        next: (response: any) => {
          this.authService.saveAuthData(response);
          this.toastService.show('Cadastro realizado com sucesso!', 'success');
          this.router.navigate(['/search']);
        },
        error: (error: any) => {
          const message = error.error?.message || 'Erro ao fazer cadastro';
          this.toastService.show(message, 'error');
          this.isLoading.set(false);
        },
      });
  }
}
