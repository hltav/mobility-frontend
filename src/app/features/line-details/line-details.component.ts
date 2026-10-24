import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { EMPTY, Subscription, catchError, finalize, forkJoin, interval, of, switchMap } from 'rxjs';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { LineStop } from '../../core/schemas/bus-line-service.schema';
import { RealTimeBus } from '../../core/schemas/real-timeBus.schema';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ThemeService } from '../../core/services/theme.service';
import { RealtimeService } from '../../core/services/real-time.service';
import { MapComponent, MapPoint } from '../../shared/components/map/map.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-line-details',
  standalone: true,
  imports: [MapComponent, IconComponent, ThemeSwitcherComponent],
  templateUrl: './line-details.component.html',
  styleUrls: ['./line-details.css', './line-details-light.css'],
})
export class LineDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly busLinesService = inject(BusLinesService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly mapCard = viewChild<ElementRef<HTMLElement>>('mapCard');
  private pollingSubscription?: Subscription;
  private pathSubscription?: Subscription;

  readonly theme = inject(ThemeService);
  readonly isPreview = this.route.snapshot.data?.['preview'] === true;
  readonly line = signal<BusLine | null>(null);
  readonly buses = signal<RealTimeBus[]>([]);
  readonly userLocation = signal<MapPoint | null>(null);
  readonly routePoints = signal<MapPoint[]>([]);
  readonly stopsOutbound = signal<LineStop[]>([]);
  readonly stopsInbound = signal<LineStop[]>([]);
  readonly currentDirection = signal<1 | 2>(1);
  readonly selectedStop = signal<LineStop | null>(null);
  readonly isLoading = signal(true);
  readonly isLoadingBuses = signal(true);
  readonly isLoadingStops = signal(true);
  readonly lineError = signal('');
  readonly busesError = signal(false);
  readonly stopsError = signal(false);
  readonly favoritesReady = signal(false);
  readonly favoriteBusy = signal(false);
  readonly infoOpen = signal(false);
  readonly mapExpanded = signal(false);
  private readonly referenceTime = signal(Date.now());
  readonly lastUpdated = signal<Date | null>(null);
  readonly currentStops = computed(() =>
    this.currentDirection() === 1 ? this.stopsOutbound() : this.stopsInbound(),
  );
  readonly validBuses = computed(() =>
    this.buses().filter(
      (bus) =>
        Number.isFinite(bus.lat) && Number.isFinite(bus.lng) && bus.lat !== 0 && bus.lng !== 0,
    ),
  );
  readonly lastQueryLabel = computed(() =>
    this.isPreview
      ? 'Simulada'
      : (this.lastUpdated()?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) ??
        'Pendente'),
  );

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.lineError.set('Linha não encontrada.');
      this.isLoading.set(false);
      return;
    }
    this.loadLineDetails(id);
    this.loadRouteStops(id);
    this.startPolling(id);
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
    this.pathSubscription?.unsubscribe();
  }

  loadLineDetails(id: number) {
    this.isLoading.set(true);
    this.lineError.set('');
    this.busLinesService
      .getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (line) => {
          this.line.set(line);
          this.loadFavoriteStatus(line);
        },
        error: () => this.lineError.set('Não foi possível carregar os detalhes desta linha.'),
      });
  }

  loadFavoriteStatus(line: BusLine) {
    this.favoritesService
      .getFavorites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (favorites) => {
          this.line.set({
            ...line,
            isFavorite: favorites.some(
              (favorite) => (favorite.database_id ?? favorite.id) === (line.database_id ?? line.id),
            ),
          });
          this.favoritesReady.set(true);
        },
        error: () => this.favoritesReady.set(false),
      });
  }

  startPolling(lineId: number) {
    this.pollingSubscription?.unsubscribe();
    this.loadBuses(lineId);
    this.pollingSubscription = interval(10000)
      .pipe(
        switchMap(() =>
          this.realtimeService.getBuses(lineId).pipe(
            catchError(() => {
              this.busesError.set(true);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((buses) => this.updateBuses(buses));
  }

  loadBuses(lineId: number) {
    this.isLoadingBuses.set(true);
    this.realtimeService
      .getBuses(lineId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingBuses.set(false)),
      )
      .subscribe({
        next: (buses) => this.updateBuses(buses),
        error: () => this.busesError.set(true),
      });
  }

  private updateBuses(buses: RealTimeBus[]) {
    this.buses.set(buses);
    this.referenceTime.set(Date.now());
    this.lastUpdated.set(new Date(this.referenceTime()));
    this.busesError.set(false);
    this.isLoadingBuses.set(false);
  }

  loadRouteStops(lineId: number) {
    this.loadRouteStopsByDirection(lineId);
  }

  loadRouteStopsByDirection(lineId: number) {
    this.isLoadingStops.set(true);
    this.stopsError.set(false);
    forkJoin({
      outbound: this.busLinesService.getStops(lineId, 1).pipe(
        catchError(() => {
          this.stopsError.set(true);
          return of([]);
        }),
      ),
      inbound: this.busLinesService.getStops(lineId, 2).pipe(
        catchError(() => {
          this.stopsError.set(true);
          return of([]);
        }),
      ),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingStops.set(false)),
      )
      .subscribe(({ outbound, inbound }) => {
        this.stopsOutbound.set(outbound);
        this.stopsInbound.set(inbound);
        this.switchDirection(
          this.line()?.direction === 2 && inbound.length
            ? 2
            : outbound.length
              ? 1
              : inbound.length
                ? 2
                : 1,
        );
      });
  }

  switchDirection(direction: 1 | 2) {
    this.currentDirection.set(direction);
    this.selectedStop.set(null);
    this.pathSubscription?.unsubscribe();
    const points = this.currentStops().map((stop) => ({ lat: stop.lat, lng: stop.lng }));
    this.routePoints.set(points);
    if (points.length < 2) return;
    this.pathSubscription = this.busLinesService
      .getRoutePath(points)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (path) => this.routePoints.set(path),
        error: () => {
          /* Keep the stop coordinates visible when routing is unavailable. */
        },
      });
  }

  requestUserLocation() {
    if (this.isPreview) {
      this.userLocation.set({ lat: -23.5505, lng: -46.6333 });
      return;
    }
    if (!navigator.geolocation) {
      this.toast.show('Localização indisponível neste navegador.', 'info');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!this.destroyRef.destroyed)
          this.userLocation.set({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        if (!this.destroyRef.destroyed)
          this.toast.show('Não foi possível obter sua localização.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  toggleFavorite() {
    const line = this.line();
    if (!line || !this.favoritesReady() || this.favoriteBusy()) return;
    if (!this.isPreview && line.isFavorite) {
      void this.router.navigate(['/favorites']);
      return;
    }
    this.favoriteBusy.set(true);
    const request = line.isFavorite
      ? this.favoritesService.removeFavorite(line.id)
      : this.favoritesService.addFavorite(line);
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.favoriteBusy.set(false)),
      )
      .subscribe({
        next: () =>
          this.line.update((current) =>
            current ? { ...current, isFavorite: !line.isFavorite } : current,
          ),
        error: () => this.toast.show('Não foi possível atualizar o favorito.', 'error'),
      });
  }

  openMap(dialog: HTMLDialogElement) {
    this.mapExpanded.set(true);
    dialog.showModal();
  }
  focusStop(stop: LineStop) {
    this.selectedStop.set(stop);
    const reduceMotion = this.document.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    this.mapCard()?.nativeElement.scrollIntoView({
      block: 'center',
      behavior: reduceMotion ? 'instant' : 'smooth',
    });
  }
  stopMapUrl(stop: LineStop) {
    return `https://www.openstreetmap.org/?mlat=${stop.lat}&mlon=${stop.lng}#map=18/${stop.lat}/${stop.lng}`;
  }
  relativeTime(value: string) {
    const seconds = Math.max(0, Math.floor((this.referenceTime() - Date.parse(value)) / 1000));
    if (!Number.isFinite(seconds)) return 'Horário indisponível';
    return seconds < 60
      ? `há ${seconds}s`
      : seconds < 3600
        ? `há ${Math.floor(seconds / 60)}min`
        : `há ${Math.floor(seconds / 3600)}h`;
  }
  goBack() {
    void this.router.navigate([this.isPreview ? '/preview/search' : '/search']);
  }
}
