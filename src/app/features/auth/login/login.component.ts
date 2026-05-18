import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequestSchema } from '../../../core/schemas/auth.schema';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  email = '';
  password = '';
  isLoading = signal(false);

  onSubmit() {
    // 🔒 evita spam de clique
    if (this.isLoading()) return;

    // 🔍 validação com Zod
    const result = LoginRequestSchema.safeParse({
      email: this.email,
      password: this.password,
    });

    if (!result.success) {
      this.toastService.show('Dados inválidos', 'error');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(result.data).subscribe({
      next: () => {
        this.toastService.show('Login realizado com sucesso!', 'success');
        this.router.navigate(['/search']);
      },
      error: (error) => {
        this.toastService.show(error?.error?.message || 'Erro ao fazer login', 'error');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
