import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { RealTimeBus } from '../../core/schemas/real-timeBus.schema';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { RealtimeService } from '../../core/services/real-time.service';
import { MapComponent } from '../../shared/components/map/map.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-line-details',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './line-details.component.html',
})
export class LineDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private busLinesService = inject(BusLinesService);
  private realtimeService = inject(RealtimeService);
  private favoritesService = inject(FavoritesService);
  private toastService = inject(ToastService);

  line = signal<BusLine | null>(null);
  buses = signal<RealTimeBus[]>([]);
  isLoading = signal(true);
  isLoadingBuses = signal(true);
  private pollingSubscription?: Subscription;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadLineDetails(id);
    this.startPolling(id);
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  loadLineDetails(id: number) {
    this.isLoading.set(true);
    this.busLinesService.getById(id).subscribe({
      next: (line) => {
        this.loadFavoriteStatus(line);
      },
      error: (error) => {
        this.toastService.show('Erro ao carregar detalhes da linha', 'error');
        this.isLoading.set(false);
      },
    });
  }

  loadFavoriteStatus(line: BusLine) {
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => {
        const isFavorite = favorites.some((f) => f.id === line.id);
        this.line.set({ ...line, isFavorite });
        this.isLoading.set(false);
      },
      error: () => {
        this.line.set({ ...line, isFavorite: false });
        this.isLoading.set(false);
      },
    });
  }

  startPolling(lineId: number) {
    this.loadBuses(lineId);
    this.pollingSubscription = interval(10000)
      .pipe(switchMap(() => this.realtimeService.getBuses(lineId)))
      .subscribe({
        next: (buses) => {
          this.buses.set(buses);
          this.isLoadingBuses.set(false);
        },
        error: () => {
          this.isLoadingBuses.set(false);
        },
      });
  }

  loadBuses(lineId: number) {
    this.realtimeService.getBuses(lineId).subscribe({
      next: (buses) => {
        this.buses.set(buses);
        this.isLoadingBuses.set(false);
      },
      error: () => {
        this.isLoadingBuses.set(false);
      },
    });
  }

  toggleFavorite() {
    const currentLine = this.line();
    if (!currentLine) return;

    if (currentLine.isFavorite) {
      // Implementar remoção quando tivermos o favorite ID
      this.toastService.show('Funcionalidade em desenvolvimento', 'info');
    } else {
      this.favoritesService.addFavorite(currentLine.id).subscribe({
        next: () => {
          this.line.set({ ...currentLine, isFavorite: true });
          this.toastService.show(`Linha ${currentLine.code} adicionada aos favoritos`, 'success');
        },
        error: () => {
          this.toastService.show('Erro ao adicionar favorito', 'error');
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/search']);
  }
}
