import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  effect,
  inject,
  input,
  viewChild
} from '@angular/core';
import type { Map, Marker, TileLayer } from 'leaflet';
import { RealTimeBus } from '../../../core/schemas/real-timeBus.schema';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `
    <div #mapContainer class="w-full rounded-2xl overflow-hidden" style="height: 400px;"></div>
  `,
})
export class MapComponent implements OnInit, OnDestroy {
  buses = input<RealTimeBus[]>([]);
  centerLat = input<number>(-23.5505);
  centerLng = input<number>(-46.6333);

  private mapContainer = viewChild<ElementRef>('mapContainer');
  private platformId = inject(PLATFORM_ID);

  private map?: Map;
  private tileLayer?: TileLayer;
  private markers: Marker[] = [];
  private L: typeof import('leaflet') | null = null;

  constructor() {
    effect(() => {
      const buses = this.buses();
      if (this.map && this.L) {
        this.updateMarkers(buses);
      }
    });
  }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.L = await import('leaflet');
    this.initMap();
  }

  ngOnDestroy() {
    this.map?.remove();
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

    this.map = L.map(this.mapContainer()!.nativeElement).setView(
      [this.centerLat(), this.centerLng()],
      13,
    );

    this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.updateMarkers(this.buses());
  }

  private updateMarkers(buses: RealTimeBus[]) {
    if (!this.L || !this.map) return;

    const L = this.L;

    // Remove marcadores antigos
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    if (buses.length === 0) return;

    const busIcon = L.divIcon({
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

    buses.forEach((bus) => {
      const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
        .addTo(this.map!)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 120px;">
            <p style="font-weight: bold; margin: 0 0 4px;">Prefixo: ${bus.prefix}</p>
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              ${bus.status === 'moving' ? '🟢 Em movimento' : '🔴 Parado'}
            </p>
          </div>
        `);
      this.markers.push(marker);
    });

    // Centraliza o mapa nos ônibus
    const group = L.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds().pad(0.2));
  }
}
