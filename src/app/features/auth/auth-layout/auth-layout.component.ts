import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeSwitcherComponent } from '../../../shared/components/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink, ThemeSwitcherComponent],
  template: `
    <section class="auth-screen" aria-labelledby="auth-title">
      <header class="auth-toolbar">
        <a routerLink="/" class="auth-return" aria-label="Voltar ao início"
          ><span aria-hidden="true">←</span></a
        >
        <app-theme-switcher />
      </header>
      <div class="auth-screen-heading">
        <h1 id="auth-title">{{ title() }}</h1>
        <p>{{ description() }}</p>
      </div>
      <ng-content />
    </section>
  `,
})
export class AuthLayoutComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
