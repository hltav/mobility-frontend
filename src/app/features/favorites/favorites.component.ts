import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { FavoritesService } from '../../core/services/favorites.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in fade-in duration-500">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Meus Favoritos</h1>
        <button routerLink="/search" class="text-blue-600 font-medium hover:underline">
          Adicionar mais
        </button>
      </div>

      <div *ngIf="isLoading()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          *ngFor="let i of [1, 2]"
          class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div class="flex-1">
              <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div class="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="!isLoading() && favorites().length === 0"
        class="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl"
      >
        <div
          class="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
        </div>
        <p class="text-slate-500">Você ainda não favoritou nenhuma linha.</p>
        <button routerLink="/search" class="mt-4 text-blue-600 font-semibold hover:underline">
          Explorar linhas
        </button>
      </div>

      <div
        *ngIf="!isLoading() && favorites().length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          *ngFor="let fav of favorites()"
          class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 p-3 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                fill="currentColor"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            </div>
            <div>
              <h4 class="font-bold leading-tight">{{ fav.code }} - {{ fav.name }}</h4>
              <p class="text-xs text-slate-500 truncate max-w-37.5 md:max-w-50">
                {{ fav.origin }} → {{ fav.destination }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              (click)="viewDetails(fav)"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              (click)="removeFavorite(fav)"
              class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FavoritesComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  favorites = signal<BusLine[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading.set(true);
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.show('Erro ao carregar favoritos', 'error');
        this.isLoading.set(false);
      },
    });
  }

  removeFavorite(line: BusLine) {
    // Por enquanto, apenas mostrar mensagem
    // Quando tivermos o ID do favorito, implementar:
    // this.favoritesService.removeFavorite(favoriteId).subscribe(...)
    this.toastService.show('Funcionalidade em desenvolvimento', 'info');
  }

  viewDetails(line: BusLine) {
    this.router.navigate(['/lines', line.id]);
  }
}
