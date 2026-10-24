import { Component, inject } from '@angular/core';
import { Theme, ThemeService } from '../../../core/services/theme.service';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [IconComponent],
  template: `<div class="theme-switcher" role="group" aria-label="Tema da interface">
    @for (option of options; track option.value) {
      <button
        type="button"
        class="icon-button"
        [class.is-selected]="theme.theme() === option.value"
        [attr.aria-label]="option.label"
        [attr.aria-pressed]="theme.theme() === option.value"
        [title]="option.label"
        (click)="theme.set(option.value)"
      >
        <app-icon [name]="option.icon" />
      </button>
    }
  </div>`,
})
export class ThemeSwitcherComponent {
  readonly theme = inject(ThemeService);
  readonly options: { value: Theme; label: string; icon: IconName }[] = [
    { value: 'light', label: 'Tema claro', icon: 'sun' },
    { value: 'dark', label: 'Tema escuro', icon: 'moon' },
    { value: 'system', label: 'Usar tema do sistema', icon: 'monitor' },
  ];
}
