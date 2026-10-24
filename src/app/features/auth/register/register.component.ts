import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RegisterRequestSchema } from '../../../core/schemas/auth.schema';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { authFailure } from '../auth-form-errors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  readonly isLoading = signal(false);
  readonly errors = signal<Record<string, string>>({});
  readonly errorMessage = signal('');
  onSubmit() {
    if (this.isLoading()) return;
    this.errors.set({});
    this.errorMessage.set('');
    const result = RegisterRequestSchema.safeParse({
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.passwordConfirmation,
    });
    if (!result.success) {
      this.errors.set(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      this.errorMessage.set('Confira os campos para criar sua conta.');
      return;
    }
    this.isLoading.set(true);
    this.authService
      .register(result.data)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toast.show('Cadastro realizado com sucesso!', 'success');
          void this.router.navigate(['/home']);
        },
        error: (error: unknown) => {
          const failure = authFailure(error);
          this.errors.set(failure.fields);
          this.errorMessage.set(failure.message);
        },
      });
  }
}
