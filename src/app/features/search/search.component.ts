import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { NearbyLine } from '../../core/schemas/nearby-response.schema';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { LineCardComponent } from '../../shared/components/line-card/line-card.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LineCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.css',
})
export class SearchComponent implements OnInit {
  private busLinesService = inject(BusLinesService);
  private favoritesService = inject(FavoritesService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  allLines = signal<(BusLine | NearbyLine)[]>([]);
  fromTerm = '';
  toTerm = '';
  isLoading = signal(false);
  isLocating = signal(false);
  isNearbyMode = signal(false);
  favorites = signal<Set<number>>(new Set());

  filteredLines = computed(() => {
    const lines = this.allLines();
    const to = this.toTerm.toLowerCase().trim();

    if (!to) return lines;

    return lines.filter(
      (line) =>
        line.code.toLowerCase().includes(to) ||
        line.name.toLowerCase().includes(to) ||
        line.destination.toLowerCase().includes(to) ||
        line.origin.toLowerCase().includes(to),
    );
  });

  ngOnInit() {
    this.loadLines();
    this.loadFavorites();
  }

  // Geolocalização via browser → reverse geocoding no backend
  useCurrentLocation() {
    if (!navigator.geolocation) {
      this.toastService.show('Geolocalização não suportada pelo navegador', 'error');
      return;
    }

    this.isLocating.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('coords:', latitude, longitude);

        this.busLinesService.reverseGeocode(latitude, longitude).subscribe({
          next: (address) => {
            this.fromTerm = address;
            this.cdr.detectChanges();
            this.isLocating.set(false);
            this.searchNearby();
          },
          error: () => {
            this.fromTerm = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            this.cdr.detectChanges();
            this.isLocating.set(false);
            this.searchNearby();
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
      this.searchNearby();
    }
  }

  onToInput() {
    // Filtro local por destino — não dispara nova requisição
    // o computed() já reage ao toTerm
  }

  onFromInput() {
    if (this.fromTerm.trim().length === 0) {
      this.isNearbyMode.set(false);
      this.loadLines();
    }
  }

  // Busca por proximidade via backend (Nominatim + Haversine)
  private searchNearby() {
    const address = this.fromTerm.trim();

    if (address.length < 4) return;

    this.isLoading.set(true);
    this.isNearbyMode.set(true);

    this.busLinesService.findNearby(address).subscribe({
      next: (result) => {
        if (!result.origin) {
          this.toastService.show('Endereço não encontrado. Tente ser mais específico.', 'error');
          this.allLines.set([]);
          this.isLoading.set(false);
          return;
        }

        const linesWithFav = result.lines.map((line) => ({
          ...line,
          isFavorite: this.favorites().has(line.id),
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
    this.isLoading.set(true);

    this.busLinesService.getAll({ per_page: 50 }).subscribe({
      next: (lines) => {
        const linesWithFav = lines.map((line) => ({
          ...line,
          isFavorite: this.favorites().has(line.id),
        }));
        this.allLines.set(linesWithFav);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.show('Erro ao carregar linhas', 'error');
        this.isLoading.set(false);
      },
    });
  }

  loadFavorites() {
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => {
        const favSet = new Set(favorites.map((f) => f.id));
        this.favorites.set(favSet);
        this.updateFavoritesStatus();
      },
      error: () => {},
    });
  }

  updateFavoritesStatus() {
    const updatedLines = this.allLines().map((line) => ({
      ...line,
      isFavorite: this.favorites().has(line.id),
    }));
    this.allLines.set(updatedLines);
  }

  toggleFavorite(line: BusLine) {
    if (line.isFavorite) {
      this.toastService.show('Funcionalidade de remover favorito em desenvolvimento', 'info');
      return;
    }

    this.favoritesService.addFavorite(line.id).subscribe({
      next: () => {
        this.favorites.update((set) => new Set(set).add(line.id));
        this.updateFavoritesStatus();
        this.toastService.show(`Linha ${line.code} adicionada aos favoritos`, 'success');
      },
      error: () => this.toastService.show('Erro ao adicionar favorito', 'error'),
    });
  }

  viewDetails(line: BusLine) {
    this.router.navigate(['/lines', line.id]);
  }
}
