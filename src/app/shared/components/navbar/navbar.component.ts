import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../icon/icon.component';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, IconComponent, ThemeSwitcherComponent],
  template: `<header class="mobile-header">
    <div class="header-content">
      <a
        class="brand"
        [routerLink]="auth.isAuthenticated() ? '/home' : '/'"
        aria-label="Mobility — início"
      >
        <span class="brand-symbol"><app-icon name="bus" /></span>
        <span
          ><span class="brand-name">Mobility<span class="text-[var(--primary)]">.</span></span>
          <span class="brand-city">SÃO PAULO</span></span
        >
      </a>
      <div class="header-actions">
        <app-theme-switcher />
        @if (auth.isAuthenticated()) {
          <button
            type="button"
            class="icon-button"
            aria-label="Sair da conta"
            title="Sair da conta"
            (click)="auth.logout()"
          >
            <app-icon name="logout" />
          </button>
        }
      </div>
    </div>
  </header>`,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
