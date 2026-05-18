import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav
      class="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
    >
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 cursor-pointer" routerLink="/search">
          <div class="bg-blue-600 p-2 rounded-lg text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
          <span class="font-bold text-xl tracking-tight"
            >Mobility<span class="text-blue-600">Go</span></span
          >
        </div>

        <div class="flex items-center gap-4">
          <button
            (click)="toggleDarkMode()"
            class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <svg
              *ngIf="!isDarkMode()"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <svg
              *ngIf="isDarkMode()"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </button>

          <button
            routerLink="/favorites"
            class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 relative cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
            <span
              *ngIf="favoriteCount() > 0"
              class="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
            >
              {{ favoriteCount() }}
            </span>
          </button>

          <button
            (click)="logout()"
            class="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);

  isDarkMode = signal(false);
  favoriteCount = signal(0);

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadFavoriteCount();
      } else {
        this.favoriteCount.set(0);
      }
    });
  }

  loadFavoriteCount() {
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => this.favoriteCount.set(favorites.length),
      error: () => this.favoriteCount.set(0),
    });
  }

  toggleDarkMode() {
    this.isDarkMode.update((v) => !v);
    document.documentElement.classList.toggle('dark', this.isDarkMode());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
