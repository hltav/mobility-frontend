import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { PwaService } from '../../core/services/pwa.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [RouterLink, IconComponent, ThemeSwitcherComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  readonly pwa = inject(PwaService);
  readonly googleMessage = signal('');
}
