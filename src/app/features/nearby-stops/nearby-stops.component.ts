import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { NearbyStop, NearbyStopsRequest } from '../../core/schemas/nearby-stop.schema';
import { StopsService } from '../../core/services/stops.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { MapComponent, MapPoint } from '../../shared/components/map/map.component';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { PREVIEW_ENABLED } from '../../preview.config';

@Component({
  selector: 'app-nearby-stops',
  standalone: true,
  imports: [RouterLink, IconComponent, MapComponent, ThemeSwitcherComponent],
  templateUrl: './nearby-stops.component.html',
  styleUrl: './nearby-stops.component.css',
})
export class NearbyStopsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(StopsService);
  private readonly destroyRef = inject(DestroyRef);
  private request?: Subscription;
  private lastOrigin?: NearbyStopsRequest;
  readonly isPreview = this.route.snapshot.data?.['preview'] === true;
  readonly previewEnabled = PREVIEW_ENABLED;
  readonly homePath = this.isPreview ? '/preview/home' : '/home';
  readonly stops = signal<NearbyStop[]>([]);
  readonly selectedStop = signal<NearbyStop | null>(null);
  readonly origin = signal<MapPoint | null>(null);
  readonly loading = signal(false);
  readonly locating = signal(false);
  readonly attempted = signal(false);
  readonly error = signal('');
  readonly originLabel = signal('');
  readonly mapOpen = signal(false);
  readonly infoOpen = signal(false);
  readonly lineChips = computed(() => {
    const stop = this.selectedStop();
    if (!stop) return [];
    return stop.arrivals.length
      ? stop.arrivals
      : stop.line_codes.map((code) => ({ code, minutes: null }));
  });

  ngOnInit() {
    if (this.isPreview) {
      this.load({ lat: -23.5505, lng: -46.6333 });
      return;
    }
    const params = this.route.snapshot.queryParamMap;
    const address = params.get('address')?.trim();
    if (address) {
      this.originLabel.set(address);
      this.load({ address });
      return;
    }
    const lat = params.get('lat');
    const lng = params.get('lng');
    if (lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)))
      this.load({ lat: Number(lat), lng: Number(lng) });
  }
  load(origin: NearbyStopsRequest) {
    this.request?.unsubscribe();
    this.lastOrigin = origin;
    this.loading.set(true);
    this.attempted.set(true);
    this.error.set('');
    this.request = this.service
      .nearest(origin, 0.5, 5)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (result) => {
          this.origin.set(result.point);
          const stops = [...result.stops]
            .filter((stop) => stop.distance_meters <= 500)
            .sort((a, b) => a.distance_meters - b.distance_meters)
            .slice(0, 5);
          this.stops.set(stops);
          this.selectedStop.set(stops[0] ?? null);
          if (!result.point)
            this.error.set('Não foi possível localizar a origem. Informe outro endereço na Home.');
        },
        error: () => {
          this.stops.set([]);
          this.selectedStop.set(null);
          this.error.set('Não foi possível carregar as paradas próximas. Tente novamente.');
        },
      });
  }
  retry() {
    if (this.lastOrigin) this.load(this.lastOrigin);
    else this.useCurrentLocation();
  }
  useCurrentLocation() {
    if (this.isPreview) {
      this.originLabel.set('Origem simulada — São Paulo');
      this.load({ lat: -23.5505, lng: -46.6333 });
      return;
    }
    if (this.locating() || this.loading()) return;
    this.lastOrigin = undefined;
    if (!navigator.geolocation) {
      this.error.set('Localização indisponível. Informe sua origem na Home.');
      return;
    }
    this.locating.set(true);
    this.error.set('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (this.destroyRef.destroyed) return;
        this.locating.set(false);
        this.originLabel.set('Localização atual');
        this.load({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        if (this.destroyRef.destroyed) return;
        this.locating.set(false);
        this.error.set(
          error.code === 1
            ? 'Localização não autorizada. Informe sua origem na Home ou permita a localização.'
            : 'Não foi possível obter sua localização. Tente novamente.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }
  selectStop(stop: NearbyStop) {
    this.selectedStop.set(stop);
  }
  openMap(stop: NearbyStop, dialog: HTMLDialogElement) {
    this.selectStop(stop);
    this.mapOpen.set(true);
    dialog.showModal();
  }
  openInfo(stop: NearbyStop, dialog: HTMLDialogElement) {
    this.selectStop(stop);
    this.infoOpen.set(true);
    dialog.showModal();
  }
  directionsUrl(stop: NearbyStop) {
    const origin = this.origin();
    return `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=walking${origin ? `&origin=${origin.lat},${origin.lng}` : ''}`;
  }
  distance(meters: number) {
    return meters < 1000
      ? `${Math.round(meters)}m`
      : `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}km`;
  }
}
