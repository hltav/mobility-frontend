import { Component, computed, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LineCardComponent } from '../../shared/components/line-card/line-card.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { ToastService } from '../../shared/services/toast.service';
import { PREVIEW_ENABLED } from '../../preview.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, LineCardComponent, ThemeSwitcherComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly busLines = inject(BusLinesService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly isPreview = inject(ActivatedRoute).snapshot.data?.['preview'] === true;
  readonly previewEnabled = PREVIEW_ENABLED;
  readonly profilePath = this.isPreview ? '/preview/profile' : '/profile';
  readonly favoritesPath = this.isPreview ? '/preview/favorites' : '/favorites';
  readonly searchPath = this.isPreview ? '/preview/search' : '/search';
  readonly mapPath = this.isPreview ? '/preview/map' : '/map';
  private linesRequest?: Subscription;
  readonly lines = signal<BusLine[]>([]);
  readonly loading = signal(true);
  readonly locating = signal(false);
  readonly error = signal('');
  readonly locationMessage = signal('');
  readonly nearby = signal(false);
  readonly favoritesReady = signal(false);
  readonly favoritesFailed = signal(false);
  readonly pendingFavorite = signal<number | null>(null);
  readonly favoriteIds = signal(new Set<number>());
  readonly filterTerm = signal('');
  readonly visibleLines = computed(() => {
    const term = this.filterTerm().trim().toLocaleLowerCase('pt-BR');
    return this.lines()
      .filter((line) =>
        `${line.code} ${line.name} ${line.origin} ${line.destination}`
          .toLocaleLowerCase('pt-BR')
          .includes(term),
      )
      .slice(0, 3);
  });
  readonly initials =
    this.auth
      .getUser()
      ?.name?.trim()
      .split(/\s+/)
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'M';
  fromTerm = '';
  toTerm = '';
  readonly firstName = this.readFirstName();

  ngOnInit() {
    this.loadLines();
    this.loadFavorites();
  }

  loadLines() {
    this.linesRequest?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.nearby.set(false);
    this.linesRequest = this.busLines
      .getAll({ per_page: 3 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (lines) => this.lines.set(lines),
        error: () => {
          this.lines.set([]);
          this.error.set('Não foi possível carregar as linhas. Tente novamente.');
        },
      });
  }

  findStops() {
    void this.router.navigate([this.isPreview ? '/preview/stops' : '/stops'], {
      queryParams: { address: this.fromTerm.trim() || null },
    });
  }

  search() {
    void this.router.navigate([this.searchPath], {
      queryParams: { from: this.fromTerm.trim() || null, to: this.toTerm.trim() || null },
    });
  }

  loadNearby() {
    if (this.fromTerm.trim().length < 4) {
      this.locationMessage.set('Informe um endereço de origem ou use sua localização.');
      return;
    }
    this.linesRequest?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.nearby.set(true);
    this.linesRequest = this.busLines
      .findNearby(this.fromTerm.trim())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (result) => {
          this.nearby.set(true);
          this.lines.set(result.lines.slice(0, 3));
          if (!result.origin) this.error.set('Não foi possível localizar esse endereço.');
        },
        error: () => {
          this.lines.set([]);
          this.error.set('A consulta de linhas próximas está indisponível.');
        },
      });
  }

  useCurrentLocation() {
    if (this.isPreview) {
      this.fromTerm = 'Origem simulada — São Paulo';
      this.loadNearby();
      return;
    }
    if (this.locating()) return;
    this.locationMessage.set('');
    if (!navigator.geolocation) {
      this.locationMessage.set(
        'Seu navegador não oferece localização. Informe o endereço de origem.',
      );
      return;
    }
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (this.destroyRef.destroyed) return;
        this.busLines
          .reverseGeocode(position.coords.latitude, position.coords.longitude)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.locating.set(false)),
          )
          .subscribe({
            next: (address) => {
              this.fromTerm = address;
              this.loadNearby();
            },
            error: () =>
              this.locationMessage.set(
                'Não foi possível identificar seu endereço. Digite a origem para continuar.',
              ),
          });
      },
      (error) => {
        if (this.destroyRef.destroyed) return;
        this.locating.set(false);
        this.locationMessage.set(
          error.code === 1
            ? 'Localização não autorizada. Você pode informar o endereço de origem.'
            : 'Não foi possível obter sua localização. Informe o endereço de origem.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  loadFavorites() {
    this.favoritesReady.set(false);
    this.favoritesFailed.set(false);
    this.favoritesService
      .getFavorites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lines) => {
          this.favoriteIds.set(new Set(lines.map((line) => line.database_id ?? line.id)));
          this.favoritesReady.set(true);
        },
        error: () => this.favoritesFailed.set(true),
      });
  }

  isFavorite(line: BusLine) {
    return this.favoriteIds().has(line.database_id ?? line.id);
  }

  toggleFavorite(line: BusLine) {
    if (!this.favoritesReady() || this.pendingFavorite() !== null) return;
    if (this.isFavorite(line)) {
      if (this.isPreview) {
        this.favoritesService.removeFavorite(line.id).subscribe(() => {
          this.favoriteIds.update((ids) => {
            const next = new Set(ids);
            next.delete(line.database_id ?? line.id);
            return next;
          });
        });
        return;
      }
      void this.router.navigate(['/favorites']);
      return;
    }
    this.pendingFavorite.set(line.id);
    this.favoritesService
      .addFavorite(line)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.pendingFavorite.set(null)),
      )
      .subscribe({
        next: () => {
          this.favoriteIds.update((ids) => new Set(ids).add(line.database_id ?? line.id));
          this.toast.show(`Linha ${line.code} adicionada aos favoritos`, 'success');
        },
        error: () => this.toast.show('Não foi possível adicionar a linha aos favoritos', 'error'),
      });
  }

  viewDetails(line: BusLine) {
    if (line.database_id != null)
      void this.router.navigate([this.isPreview ? '/preview/lines' : '/lines', line.database_id]);
    else
      this.toast.show(
        'Os detalhes desta linha ainda não estão disponíveis no cadastro local.',
        'info',
      );
  }

  private readFirstName(): string {
    try {
      const name: unknown = this.auth.getUser()?.name;
      return typeof name === 'string' ? name.trim().split(/\s+/)[0] : '';
    } catch {
      return '';
    }
  }
}
