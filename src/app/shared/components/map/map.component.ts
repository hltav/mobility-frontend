import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  effect,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type {
  Circle,
  CircleMarker,
  LatLngExpression,
  Map as LeafletMap,
  Marker,
  Polyline,
  TileLayer,
} from 'leaflet';
import { RealTimeBus } from '../../../core/schemas/real-timeBus.schema';

export interface MapPoint {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div
    #mapContainer
    class="w-full overflow-hidden"
    [style.height]="cssHeight()"
    aria-label="Mapa interativo da linha"
  ></div>`,
  styles: [':host{display:block;min-width:0;border-radius:inherit;overflow:hidden}'],
})
export class MapComponent implements OnInit, OnDestroy {
  readonly showZoomControls = input(true);
  readonly fitKey = input<string | number | null>(null);
  readonly height = input<number | string>(400);
  readonly cssHeight = computed(() =>
    typeof this.height() === 'number' ? `${this.height()}px` : this.height(),
  );
  readonly focusedPoint = input<MapPoint | null>(null);
  buses = input<RealTimeBus[]>([]);
  routePoints = input<MapPoint[]>([]);
  userPoint = input<MapPoint | null>(null);
  centerLat = input<number>(-23.5505);
  centerLng = input<number>(-46.6333);

  private mapContainer = viewChild<ElementRef>('mapContainer');
  private platformId = inject(PLATFORM_ID);

  private destroyed = false;
  private resizeObserver?: ResizeObserver;
  private focusMarker?: CircleMarker;
  private map?: LeafletMap;
  private tileLayer?: TileLayer;
  private markers = new Map<string, Marker>();
  private accuracyCircles = new Map<string, Circle>();
  private userMarker?: Marker;
  private routeLine?: Polyline;
  private L: typeof import('leaflet') | null = null;
  private hasAutoFit = false;
  private hasRouteAutoFit = false;
  private isAutoMoving = false;
  private userMovedMap = false;

  constructor() {
    effect(() => {
      this.fitKey();
      this.hasAutoFit = false;
      this.hasRouteAutoFit = false;
      this.userMovedMap = false;
    });
    effect(() => {
      const point = this.focusedPoint();
      if (this.map && this.L) this.updateFocusedPoint(point);
    });
    effect(() => {
      const buses = this.buses();
      if (this.map && this.L) {
        this.updateBuses(buses);
      }
    });

    effect(() => {
      const routePoints = this.routePoints();
      if (this.map && this.L) {
        this.updateRoute(routePoints);
      }
    });

    effect(() => {
      const userPoint = this.userPoint();
      if (this.map && this.L) {
        this.updateUserMarker(userPoint);
      }
    });
  }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const leaflet = await import('leaflet');
    if (this.destroyed) return;
    this.L = leaflet;
    this.initMap();
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.map?.remove();
    this.map = undefined;
  }

  zoomIn() {
    this.map?.zoomIn();
  }
  zoomOut() {
    this.map?.zoomOut();
  }

  private initMap() {
    if (!this.L || !this.mapContainer()?.nativeElement) return;

    const L = this.L;

    // Fix ícones do Leaflet com Webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    this.map = L.map(this.mapContainer()!.nativeElement, { zoomControl: false }).setView(
      [this.centerLat(), this.centerLng()],
      13,
    );
    if (this.showZoomControls()) L.control.zoom({ position: 'bottomleft' }).addTo(this.map);
    this.map.on('dragstart zoomstart', () => {
      if (!this.isAutoMoving) {
        this.userMovedMap = true;
      }
    });

    this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.map?.invalidateSize();
        this.fitInitialView();
      });
      this.resizeObserver.observe(this.mapContainer()!.nativeElement);
    }
    setTimeout(() => this.map?.invalidateSize(), 0);
    this.updateRoute(this.routePoints());
    this.updateUserMarker(this.userPoint());
    this.updateBuses(this.buses());
    this.updateFocusedPoint(this.focusedPoint());
  }

  private updateBuses(buses: RealTimeBus[]) {
    if (!this.L || !this.map) return;

    const L = this.L;

    const validBuses = buses.filter((bus) => this.hasValidCoordinates(bus));
    const visibleBusKeys = new Set(validBuses.map((bus) => this.busKey(bus)));

    for (const [key, marker] of this.markers) {
      if (!visibleBusKeys.has(key)) {
        marker.remove();
        this.markers.delete(key);
      }
    }

    for (const [key, circle] of this.accuracyCircles) {
      if (!visibleBusKeys.has(key)) {
        circle.remove();
        this.accuracyCircles.delete(key);
      }
    }

    validBuses.forEach((bus) => {
      const key = this.busKey(bus);
      const position: LatLngExpression = [bus.lat, bus.lng];
      const popup = this.mapContainer()!.nativeElement.ownerDocument.createElement('div');
      popup.style.cssText = 'font-family:sans-serif;min-width:120px;color:#0f172a';
      const title = popup.ownerDocument.createElement('strong');
      title.textContent = `Prefixo: ${bus.prefix}`;
      const description = popup.ownerDocument.createElement('p');
      description.style.cssText = 'margin:4px 0 0;color:#64748b;font-size:12px';
      description.textContent = `${bus.status === 'moving' ? 'Em movimento' : 'Parado'} • Posição aproximada`;
      popup.append(title, description);
      const existingMarker = this.markers.get(key);
      const existingCircle = this.accuracyCircles.get(key);

      if (existingMarker && existingCircle) {
        existingMarker.setLatLng(position);
        existingMarker.setPopupContent(popup);
        existingCircle.setLatLng(position);
        return;
      }

      const marker = L.marker(position, { icon: this.createBusIcon() })
        .addTo(this.map!)
        .bindPopup(popup);
      const circle = L.circle(position, {
        radius: 80,
        color: '#2563eb',
        weight: 1,
        fillColor: '#2563eb',
        fillOpacity: 0.1,
      }).addTo(this.map!);

      this.markers.set(key, marker);
      this.accuracyCircles.set(key, circle);
    });

    this.map.invalidateSize();
    this.fitInitialView();
  }

  private updateRoute(routePoints: MapPoint[]) {
    if (!this.L || !this.map) return;

    this.routeLine?.remove();
    this.routeLine = undefined;

    const validRoutePoints = routePoints.filter((point) => this.hasValidPoint(point));

    if (validRoutePoints.length < 2) {
      this.fitInitialView();
      return;
    }

    this.routeLine = this.L.polyline(
      validRoutePoints.map((point) => [point.lat, point.lng]),
      {
        color: '#1447e6',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      },
    ).addTo(this.map);
    this.routeLine.bringToBack();

    if (!this.userMovedMap && !this.hasRouteAutoFit) {
      this.hasAutoFit = false;
      this.hasRouteAutoFit = true;
    }
    this.fitInitialView();
  }

  private updateUserMarker(userPoint: MapPoint | null) {
    if (!this.L || !this.map) return;

    this.userMarker?.remove();
    this.userMarker = undefined;

    if (!userPoint || !this.hasValidPoint(userPoint)) return;

    this.userMarker = this.L.marker([userPoint.lat, userPoint.lng], {
      icon: this.L.divIcon({
        html: `
          <div style="
            width: 22px;
            height: 22px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 999px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.35);
          "></div>
        `,
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    })
      .addTo(this.map)
      .bindPopup('Sua localização aproximada');
    this.map.setView([userPoint.lat, userPoint.lng], Math.max(this.map.getZoom(), 15), {
      animate: false,
    });
  }

  private updateFocusedPoint(point: MapPoint | null) {
    if (!this.map || !this.L) return;
    this.focusMarker?.remove();
    this.focusMarker = undefined;
    if (!point || !this.hasValidPoint(point)) return;
    this.focusMarker = this.L.circleMarker([point.lat, point.lng], {
      radius: 8,
      color: '#fff',
      weight: 3,
      fillColor: '#14b8a6',
      fillOpacity: 1,
    })
      .addTo(this.map)
      .bindTooltip('Parada selecionada');
    this.map.setView([point.lat, point.lng], Math.max(this.map.getZoom(), 16), { animate: false });
  }

  private fitInitialView() {
    if (!this.L || !this.map || this.hasAutoFit || this.userMovedMap) return;

    const container = this.mapContainer()?.nativeElement;
    if (!container?.clientWidth || !container.clientHeight) return;

    const layers = [
      ...this.markers.values(),
      ...(this.routeLine ? [this.routeLine] : []),
      ...(this.userMarker ? [this.userMarker] : []),
    ];

    if (layers.length === 0) return;

    const group = this.L.featureGroup(layers);
    const bounds = group.getBounds();
    this.isAutoMoving = true;

    if (layers.length === 1 && this.markers.size === 1) {
      const firstMarker = [...this.markers.values()][0];
      this.map.setView(firstMarker.getLatLng(), 16, { animate: false });
    } else {
      this.map.fitBounds(bounds.pad(0.2), { maxZoom: 16, animate: false });
    }

    this.hasAutoFit = true;
    setTimeout(() => {
      this.isAutoMoving = false;
    }, 0);
  }

  private createBusIcon() {
    return this.L!.divIcon({
      html: `
        <div style="
          background: #2563eb;
          border: 2px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  private busKey(bus: RealTimeBus) {
    return bus.prefix || `${bus.lat}:${bus.lng}`;
  }

  private hasValidCoordinates(bus: RealTimeBus) {
    return this.hasValidPoint(bus);
  }

  private hasValidPoint(point: MapPoint) {
    return (
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180 &&
      point.lat !== 0 &&
      point.lng !== 0
    );
  }
}
