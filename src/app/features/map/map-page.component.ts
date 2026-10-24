import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  EMPTY,
  Subject,
  Subscription,
  catchError,
  finalize,
  interval,
  startWith,
  switchMap,
} from 'rxjs';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { RealTimeBus } from '../../core/schemas/real-timeBus.schema';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { RealtimeService } from '../../core/services/real-time.service';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { MapComponent, MapPoint } from '../../shared/components/map/map.component';
import { PREVIEW_ENABLED } from '../../preview.config';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [FormsModule, RouterLink, MapComponent, ThemeSwitcherComponent, IconComponent],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.css',
})
export class MapPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly busLines = inject(BusLinesService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly lineChanges = new Subject<number | null>();
  private routeRequest?: Subscription;
  private linesRequest?: Subscription;
  readonly isPreview = this.route.snapshot.data?.['preview'] === true;
  readonly previewEnabled = PREVIEW_ENABLED;
  readonly lines = signal<BusLine[]>([]);
  readonly selectedLine = signal<BusLine | null>(null);
  readonly buses = signal<RealTimeBus[]>([]);
  readonly routePoints = signal<MapPoint[]>([]);
  readonly userPoint = signal<MapPoint | null>(null);
  readonly loadingLines = signal(true);
  readonly loadingBuses = signal(false);
  readonly linesError = signal('');
  readonly busesError = signal(false);
  readonly locationMessage = signal('');
  readonly locating = signal(false);
  readonly filtersOpen = signal(false);
  readonly lineFilter = signal('');
  readonly direction = signal<0 | 1 | 2>(0);
  readonly onlyMoving = signal(false);
  readonly showRoute = signal(false);
  readonly routeError = signal('');
  readonly hasDirectionData = computed(() =>
    this.lines().some((line) => line.direction === 1 || line.direction === 2),
  );
  readonly visibleLines = computed(() => {
    const term = this.normalize(this.lineFilter());
    return this.lines().filter(
      (line) =>
        this.normalize(`${line.code} ${line.name} ${line.origin} ${line.destination}`).includes(
          term,
        ) &&
        (!this.direction() || line.direction === this.direction()),
    );
  });
  readonly visibleBuses = computed(() =>
    this.buses().filter(
      (bus) =>
        (!this.onlyMoving() || bus.status === 'moving') &&
        Number.isFinite(bus.lat) &&
        Number.isFinite(bus.lng) &&
        bus.lat !== 0 &&
        bus.lng !== 0,
    ),
  );
  readonly liveLabel = computed(() => {
    if (this.loadingLines()) return 'Buscando linhas…';
    const line = this.selectedLine();
    if (!line) return 'Selecione uma linha';
    return `Linha ${line.code} • ${this.loadingBuses() ? 'Atualizando…' : this.busesError() ? 'Sem atualização' : this.isPreview ? 'DEMO' : 'Ao vivo'}`;
  });

  ngOnInit() {
    this.lineChanges
      .pipe(
        switchMap((id) =>
          id == null
            ? EMPTY
            : interval(10000).pipe(
                startWith(0),
                switchMap(() =>
                  this.realtime.getBuses(id).pipe(
                    catchError(() => {
                      this.busesError.set(true);
                      this.loadingBuses.set(false);
                      return EMPTY;
                    }),
                  ),
                ),
              ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((buses) => {
        this.buses.set(buses);
        this.loadingBuses.set(false);
        this.busesError.set(false);
      });
    this.loadLines();
  }

  loadLines() {
    this.linesRequest?.unsubscribe();
    this.loadingLines.set(true);
    this.linesError.set('');
    this.linesRequest = this.busLines
      .getAll({ per_page: 6 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingLines.set(false)),
      )
      .subscribe({
        next: (lines) => {
          this.lines.set(lines);
          const preferred = Number(this.route.snapshot.queryParamMap.get('line'));
          const options = this.visibleLines();
          this.selectLine(
            options.find((line) => (line.database_id ?? line.id) === preferred) ??
              options.find((line) => line.database_id != null) ??
              null,
          );
        },
        error: () => {
          this.lines.set([]);
          this.selectLine(null);
          this.linesError.set('Não foi possível carregar as linhas do mapa.');
        },
      });
  }

  selectLine(line: BusLine | null) {
    this.routeRequest?.unsubscribe();
    this.routePoints.set([]);
    this.routeError.set('');
    this.buses.set([]);
    this.busesError.set(false);
    this.selectedLine.set(line);
    this.loadingBuses.set(!!line);
    this.lineChanges.next(line?.database_id ?? null);
    if (line?.database_id == null) this.loadingBuses.set(false);
    if (line && this.showRoute()) this.loadRoute();
  }
  setLineFilter(value: string) {
    this.lineFilter.set(value);
    this.ensureVisibleSelection();
  }
  setDirection(value: 0 | 1 | 2) {
    this.direction.set(value);
    this.ensureVisibleSelection();
  }
  private ensureVisibleSelection() {
    if (!this.visibleLines().some((line) => line.id === this.selectedLine()?.id))
      this.selectLine(this.visibleLines().find((line) => line.database_id != null) ?? null);
  }
  setShowRoute(value: boolean) {
    this.showRoute.set(value);
    this.routeRequest?.unsubscribe();
    this.routePoints.set([]);
    this.routeError.set('');
    if (value) this.loadRoute();
  }
  private loadRoute() {
    const line = this.selectedLine();
    if (line?.database_id == null) return;
    this.routeRequest = this.busLines
      .getStops(line.database_id, line.direction ?? 1)
      .pipe(
        switchMap((stops) =>
          this.busLines.getRoutePath(stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (points) => {
          this.routePoints.set(points);
          if (points.length < 2) this.routeError.set('Trajeto indisponível para esta linha.');
        },
        error: () => this.routeError.set('Não foi possível carregar o trajeto.'),
      });
  }
  refreshBuses() {
    const id = this.selectedLine()?.database_id;
    if (id != null) {
      this.loadingBuses.set(true);
      this.lineChanges.next(id);
    }
  }
  useCurrentLocation() {
    this.locationMessage.set('');
    if (this.isPreview) {
      this.userPoint.set({ lat: -23.5505, lng: -46.6333 });
      this.locationMessage.set('Localização simulada para esta prévia.');
      return;
    }
    if (this.locating()) return;
    if (!navigator.geolocation) {
      this.locationMessage.set('Localização indisponível neste navegador.');
      return;
    }
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (this.destroyRef.destroyed) return;
        this.locating.set(false);
        this.userPoint.set({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        if (this.destroyRef.destroyed) return;
        this.locating.set(false);
        this.locationMessage.set(
          error.code === 1
            ? 'Localização não autorizada. Você pode explorar o mapa manualmente.'
            : 'Não foi possível obter sua localização.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }
  private normalize(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
