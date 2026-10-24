import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly media =
    this.browser && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  private readonly preference = signal<Theme>(this.readPreference());
  private readonly systemDark = signal(this.media?.matches ?? false);
  readonly theme = this.preference.asReadonly();
  readonly isDark = computed(
    () => this.theme() === 'dark' || (this.theme() === 'system' && this.systemDark()),
  );

  constructor() {
    const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
    this.media?.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));
    effect(() => {
      const dark = this.isDark();
      this.document.documentElement.classList.toggle('dark', dark);
      this.document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
      this.document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#020617' : '#F8FAFC');
    });
  }

  set(theme: Theme) {
    if (!['light', 'dark', 'system'].includes(theme)) return;
    this.preference.set(theme);
    if (this.browser) {
      try {
        localStorage.setItem('mobility-theme', theme);
      } catch {
        /* The preference still works in memory. */
      }
    }
  }

  private readPreference(): Theme {
    if (!this.browser) return 'system';
    try {
      const saved = localStorage.getItem('mobility-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      const legacy = localStorage.getItem('theme');
      if (legacy === 'light' || legacy === 'dark') {
        localStorage.setItem('mobility-theme', legacy);
        return legacy;
      }
    } catch {
      /* Storage may be unavailable in private or restricted contexts. */
    }
    return 'system';
  }
}
