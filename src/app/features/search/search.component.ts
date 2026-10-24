import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  Subject,
  Subscription,
} from 'rxjs';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { NearbyLine } from '../../core/schemas/nearby-response.schema';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { LineCardComponent } from '../../shared/components/line-card/line-card.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ToastService } from '../../shared/services/toast.service';
import { PREVIEW_ENABLED } from '../../preview.config';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LineCardComponent,
    ThemeSwitcherComponent,
    IconComponent,
    RouterLink,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.css',
})
export class SearchComponent implements OnInit {
  private busLinesService = inject(BusLinesService);
  private favoritesService = inject(FavoritesService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly isPreview = this.route.snapshot.data?.['preview'] === true;
  readonly previewEnabled = PREVIEW_ENABLED;
  private cdr = inject(ChangeDetectorRef);

  private readonly destroyRef = inject(DestroyRef);
  private readonly queryChanges = new Subject<string>();
  private listRequest?: Subscription;
  readonly query = signal('');
  readonly direction = signal<0 | 1 | 2>(0);
  readonly onlyFavorites = signal(false);
  readonly filtersOpen = signal(false);
  readonly searchError = signal('');
  readonly hasDirectionData = computed(() =>
    this.allLines().some((line) => line.direction === 1 || line.direction === 2),
  );

  allLines = signal<(BusLine | NearbyLine)[]>([]);
  fromTerm = '';
  toTerm = '';
  isLoading = signal(false);
  isLocating = signal(false);
  isNearbyMode = signal(false);
  isRouteMode = signal(false);
  favorites = signal<Set<number>>(new Set());
  readonly favoritesReady = signal(false);
  readonly favoritesFailed = signal(false);
  readonly pendingFavorite = signal<number | null>(null);

  filteredLines = computed(() => {
    const lines = this.uniqueLines(this.allLines());
    const term = this.normalizeText(this.query());
    return lines.filter(
      (line) =>
        (!term || this.lineMatchesTerm(line, term)) &&
        (this.direction() === 0 || line.direction === this.direction()) &&
        (!this.onlyFavorites() || line.isFavorite),
    );
  });

  onQueryChange(value: string) {
    this.query.set(value);
    this.queryChanges.next(value.trim());
  }

  ngOnInit() {
    this.queryChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadLines());
    this.fromTerm = this.route.snapshot.queryParamMap.get('from') ?? '';
    this.toTerm = this.route.snapshot.queryParamMap.get('to') ?? '';
    this.filtersOpen.set(!!(this.fromTerm || this.toTerm));
    if (this.fromTerm.trim().length >= 4) this.searchByCurrentTerms();
    else this.loadLines();
    this.loadFavorites();
  }

  // Geolocalização via browser → reverse geocoding no backend
  useCurrentLocation() {
    if (this.isPreview) {
      this.fromTerm = 'Origem simulada — São Paulo';
      this.searchByCurrentTerms();
      return;
    }
    if (!navigator.geolocation) {
      this.toastService.show('Geolocalização não suportada pelo navegador', 'error');
      return;
    }

    this.isLocating.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        this.busLinesService.reverseGeocode(latitude, longitude).subscribe({
          next: (address) => {
            this.fromTerm = address;
            this.cdr.detectChanges();
            this.isLocating.set(false);
            this.searchByCurrentTerms();
          },
          error: () => {
            this.fromTerm = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            this.cdr.detectChanges();
            this.isLocating.set(false);
            this.searchByCurrentTerms();
          },
        });
      },
      () => {
        this.toastService.show('Erro ao obter localização', 'error');
        this.isLocating.set(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  onFromBlur() {
    if (this.fromTerm.trim().length > 3) {
      this.searchByCurrentTerms();
    }
  }

  onToInput() {
    this.isRouteMode.set(false);

    if (this.toTerm.trim().length === 0 && this.fromTerm.trim().length > 3) {
      this.searchNearby();
    }
  }

  onToBlur() {
    if (this.toTerm.trim().length > 3) {
      this.searchByCurrentTerms();
    }
  }

  onFromInput() {
    this.isRouteMode.set(false);

    if (this.fromTerm.trim().length === 0) {
      this.isNearbyMode.set(false);
      this.loadLines();
    }
  }

  private searchByCurrentTerms() {
    const from = this.fromTerm.trim();
    const to = this.toTerm.trim();

    if (from.length < 4) return;

    if (to.length > 3) {
      this.searchRoute(from, to);
      return;
    }

    this.searchNearby();
  }

  private searchRoute(fromAddress: string, toAddress: string) {
    this.listRequest?.unsubscribe();
    this.isLoading.set(true);
    this.isNearbyMode.set(true);
    this.isRouteMode.set(true);
    this.searchError.set('');
    this.listRequest = forkJoin({
      tripLines: this.busLinesService.findTripLinesSafe(fromAddress, toAddress),
      originNearby: this.busLinesService.findNearbySafe(fromAddress, 2),
      destinationNearby: this.busLinesService.findNearbySafe(toAddress, 2),
      originText: this.busLinesService.getAll({ term: fromAddress, per_page: 100 }),
      destinationText: this.busLinesService.getAll({ term: toAddress, per_page: 100 }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tripLines, originNearby, destinationNearby, originText, destinationText }) => {
          const originCandidates = originText.length > 0 ? originText : originNearby.lines;
          const destinationCandidates =
            destinationText.length > 0 ? destinationText : destinationNearby.lines;
          const matchingLines = this.findMatchingLines(originCandidates, destinationCandidates);
          const hasTextRoute = originText.length > 0 || destinationText.length > 0;
          const lines =
            matchingLines.length > 0 || hasTextRoute ? matchingLines : this.uniqueLines(tripLines);
          const linesWithFav = lines.map((line) => ({
            ...line,
            isFavorite: this.favorites().has(line.database_id ?? line.id),
          }));

          this.allLines.set(linesWithFav);
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.show('Erro ao buscar linhas para o trajeto', 'error');
          this.isLoading.set(false);
        },
      });
  }

  private findMatchingLines(originCandidates: BusLine[], destinationCandidates: BusLine[]) {
    const destinationSignatures = new Set(
      destinationCandidates.map((line) => this.lineSignature(line)),
    );

    return this.uniqueLines(
      originCandidates.filter((line) => destinationSignatures.has(this.lineSignature(line))),
    );
  }

  private uniqueLines<T extends BusLine>(lines: T[]) {
    const linesBySignature = new Map<string, BusLine>();

    for (const line of lines) {
      linesBySignature.set(this.lineSignature(line), line);
    }

    return [...linesBySignature.values()] as T[];
  }

  private lineSignature(line: BusLine) {
    return [line.code, line.origin, line.destination]
      .map((value) => this.normalizeText(value))
      .join('|');
  }

  private lineMatchesTerm(line: BusLine, normalizedTerm: string) {
    return [line.code, line.name, line.origin, line.destination].some((value) =>
      this.normalizeText(value).includes(normalizedTerm),
    );
  }

  private normalizeText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  // Busca por proximidade via backend (Nominatim + Haversine)
  private searchNearby() {
    const address = this.fromTerm.trim();

    if (address.length < 4) return;

    this.listRequest?.unsubscribe();
    this.isLoading.set(true);
    this.isNearbyMode.set(true);
    this.isRouteMode.set(false);
    this.searchError.set('');
    this.listRequest = this.busLinesService
      .findNearby(address)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (!result.origin) {
            this.toastService.show('Endereço não encontrado. Tente ser mais específico.', 'error');
            this.allLines.set([]);
            this.isLoading.set(false);
            return;
          }

          const linesWithFav = this.uniqueLines(result.lines).map((line) => ({
            ...line,
            isFavorite: this.favorites().has(line.database_id ?? line.id),
          }));

          this.allLines.set(linesWithFav);
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.show('Erro ao buscar linhas próximas', 'error');
          this.isLoading.set(false);
        },
      });
  }

  loadLines() {
    this.listRequest?.unsubscribe();
    this.isLoading.set(true);
    this.searchError.set('');
    this.isNearbyMode.set(false);
    this.isRouteMode.set(false);
    const term = this.query().trim();
    this.listRequest = this.busLinesService
      .getAll(term ? { term, per_page: 50 } : { per_page: 50 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (lines) =>
          this.allLines.set(
            this.uniqueLines(lines).map((line) => ({
              ...line,
              isFavorite: this.favorites().has(line.database_id ?? line.id),
            })),
          ),
        error: () => {
          this.allLines.set([]);
          this.searchError.set('Não foi possível carregar as linhas. Tente novamente.');
        },
      });
  }

  loadFavorites() {
    this.favoritesReady.set(false);
    this.favoritesFailed.set(false);
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => {
        const favSet = new Set(favorites.map((f) => f.database_id ?? f.id));
        this.favorites.set(favSet);
        this.updateFavoritesStatus();
        this.favoritesReady.set(true);
      },
      error: () => this.favoritesFailed.set(true),
    });
  }

  updateFavoritesStatus() {
    const updatedLines = this.uniqueLines(this.allLines()).map((line) => ({
      ...line,
      isFavorite: this.favorites().has(line.database_id ?? line.id),
    }));
    this.allLines.set(updatedLines);
  }

  toggleFavorite(line: BusLine) {
    if (!this.favoritesReady() || this.pendingFavorite() !== null) return;
    if (line.isFavorite) {
      if (this.isPreview) {
        this.favoritesService.removeFavorite(line.id).subscribe(() => {
          this.favorites.update((ids) => {
            const next = new Set(ids);
            next.delete(line.database_id ?? line.id);
            return next;
          });
          this.updateFavoritesStatus();
        });
        return;
      }
      void this.router.navigate(['/favorites']);
      return;
    }

    this.pendingFavorite.set(line.id);
    this.favoritesService
      .addFavorite(line)
      .pipe(finalize(() => this.pendingFavorite.set(null)))
      .subscribe({
        next: () => {
          this.favorites.update((set) => new Set(set).add(line.database_id ?? line.id));
          this.updateFavoritesStatus();
          this.toastService.show(`Linha ${line.code} adicionada aos favoritos`, 'success');
        },
        error: () => this.toastService.show('Erro ao adicionar favorito', 'error'),
      });
  }

  viewDetails(line: BusLine) {
    if (line.database_id != null)
      void this.router.navigate([this.isPreview ? '/preview/lines' : '/lines', line.database_id]);
    else
      this.toastService.show(
        'Os detalhes desta linha ainda não estão disponíveis no cadastro local.',
        'info',
      );
  }
}
