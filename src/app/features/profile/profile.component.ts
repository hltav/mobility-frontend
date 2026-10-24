import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { PwaService } from '../../core/services/pwa.service';
import { Theme, ThemeService } from '../../core/services/theme.service';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IconComponent, ThemeSwitcherComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  readonly currentYear = new Date().getFullYear();
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly pwa = inject(PwaService);
  private readonly favorites = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly isPreview = inject(ActivatedRoute).snapshot.data?.['preview'] === true;
  readonly user = this.auth.getUser();
  readonly initials =
    this.user?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'M';
  readonly favoritesCount = signal<number | null>(null);
  readonly information = signal<'privacy' | 'about' | 'help' | null>(null);
  readonly options: { value: Theme; label: string; description: string; icon: IconName }[] = [
    { value: 'light', label: 'Light', description: 'Claro', icon: 'sun' },
    { value: 'dark', label: 'Dark', description: 'Escuro', icon: 'moon' },
    { value: 'system', label: 'System', description: 'Auto', icon: 'monitor' },
  ];

  ngOnInit() {
    this.favorites
      .getFavorites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lines) => this.favoritesCount.set(lines.length),
        error: () => this.favoritesCount.set(null),
      });
  }

  preferences(section: HTMLElement) {
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    section
      .querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.focus({ preventScroll: true });
  }

  logout() {
    if (this.isPreview) void this.router.navigate(['/']);
    else this.auth.logout();
  }
}
