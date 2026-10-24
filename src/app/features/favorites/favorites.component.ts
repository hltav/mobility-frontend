import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { FavoritesService } from '../../core/services/favorites.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, IconComponent, ThemeSwitcherComponent],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class FavoritesComponent implements OnInit {
  private readonly service = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isPreview = inject(ActivatedRoute).snapshot.data?.['preview'] === true;
  readonly searchPath = this.isPreview ? '/preview/search' : '/search';
  readonly favorites = signal<BusLine[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal('');
  readonly pending = signal<number | null>(null);

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    if (!this.isLoading() || !this.favorites().length) {
      this.isLoading.set(true);
      this.error.set('');
      this.service
        .getFavorites()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.isLoading.set(false)),
        )
        .subscribe({
          next: (lines) => this.favorites.set(lines),
          error: () => this.error.set('Não foi possível carregar suas linhas favoritas.'),
        });
    }
  }

  removeFavorite(line: BusLine) {
    if (this.pending() !== null) return;
    if (line.favorite_id == null) {
      this.toast.show(
        'Não foi possível identificar este favorito. Atualize a lista para tentar novamente.',
        'error',
      );
      return;
    }
    this.pending.set(line.id);
    this.service
      .removeFavorite(line.favorite_id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.pending.set(null)),
      )
      .subscribe({
        next: () => {
          this.favorites.update((lines) => lines.filter((item) => item.id !== line.id));
          this.toast.show(`Linha ${line.code} removida dos favoritos`, 'success');
        },
        error: () => this.toast.show('Não foi possível remover a linha. Tente novamente.', 'error'),
      });
  }

  viewDetails(line: BusLine) {
    void this.router.navigate([
      this.isPreview ? '/preview/lines' : '/lines',
      line.database_id ?? line.id,
    ]);
  }
}
