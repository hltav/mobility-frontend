import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { PwaStatusComponent } from './shared/components/pwa-status/pwa-status.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    ToastComponent,
    BottomNavComponent,
    PwaStatusComponent,
  ],
  template: `
    <div
      class="app-shell"
      [class.app-shell--authenticated]="authenticatedArea() || previewArea()"
      [class.app-shell--entry]="entryArea()"
      [class.app-shell--landing]="landingArea()"
      [class.app-shell--home]="homeArea()"
      [class.app-shell--compact]="compactArea()"
      [class.app-shell--details]="detailsArea()"
      [class.app-shell--map]="mapArea()"
      [class.app-shell--stops]="stopsArea()"
      [class.app-shell--home-light]="homeArea() && !theme.isDark()"
    >
      <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
      @if (!entryArea() && !compactArea() && !detailsArea() && !stopsArea()) {
        <app-navbar />
      }
      <app-pwa-status />
      <main #content id="main-content" class="app-content" tabindex="-1">
        <router-outlet (activate)="content.scrollTop = 0" />
      </main>
      @if ((authenticatedArea() || previewArea()) && !detailsArea() && !stopsArea()) {
        <app-bottom-nav [preview]="previewArea()" />
      }
      <app-toast />
    </div>
  `,
})
export class AppComponent {
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] },
  );
  readonly stopsArea = computed(() => ['/stops', '/preview/stops'].includes(this.url()));
  readonly mapArea = computed(() => ['/map', '/preview/map'].includes(this.url()));
  readonly detailsArea = computed(() => /^\/(?:preview\/)?lines\/[^/]+$/.test(this.url()));
  readonly previewArea = computed(() => this.url().startsWith('/preview/'));
  readonly compactArea = computed(
    () =>
      (this.auth.isAuthenticated() &&
        ['/home', '/search', '/map', '/favorites', '/profile'].includes(this.url())) ||
      [
        '/preview/home',
        '/preview/search',
        '/preview/map',
        '/preview/favorites',
        '/preview/profile',
      ].includes(this.url()),
  );
  readonly homeArea = computed(
    () => (this.auth.isAuthenticated() && this.url() === '/home') || this.url() === '/preview/home',
  );
  readonly entryArea = computed(() => ['/', '/login', '/register'].includes(this.url()));
  readonly landingArea = computed(() => this.url() === '/');
  readonly authenticatedArea = computed(
    () => this.auth.isAuthenticated() && !['/login', '/register', '/'].includes(this.url()),
  );
}
