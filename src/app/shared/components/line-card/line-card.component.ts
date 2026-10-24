import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BusLine } from '../../../core/schemas/bus-line.schema';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-line-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  styleUrl: './line-card.component.css',
  template: `
    @if (compact) {
      <article class="compact-line">
        <button
          type="button"
          class="compact-details"
          (click)="onViewDetails()"
          [attr.aria-label]="'Ver detalhes da linha ' + line.code + ', ' + line.name"
        >
          <span class="compact-code">{{ line.code }}</span>
          <span class="compact-text"
            ><span class="compact-name">{{ line.name }}</span
            ><span class="compact-route"
              ><app-icon name="route" />{{ line.origin }} → {{ line.destination }}</span
            ></span
          >
        </button>
        @if (line.buses.length) {
          <span class="compact-buses" [attr.aria-label]="line.buses.length + ' ônibus'"
            ><app-icon name="bus-side" />{{ line.buses.length }}</span
          >
        }
        <button
          type="button"
          class="compact-favorite"
          (click)="onToggleFavorite()"
          [disabled]="favoriteDisabled"
          [attr.aria-pressed]="favoriteActive"
          [attr.aria-label]="
            favoriteActive
              ? 'Abrir favoritos da linha ' + line.code
              : 'Favoritar linha ' + line.code
          "
        >
          <app-icon name="heart" />
        </button>
        <button
          type="button"
          class="compact-chevron"
          (click)="onViewDetails()"
          [attr.aria-label]="'Abrir linha ' + line.code"
        >
          ›
        </button>
      </article>
    } @else {
      <div
        class="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] hover:shadow-md transition-shadow group"
      >
        <div class="flex justify-between items-start mb-4">
          <span
            class="bg-[var(--primary-soft)] text-[var(--primary)] px-3 py-1 rounded-lg font-bold text-lg"
          >
            {{ line.code }}
          </span>
          <button
            (click)="onToggleFavorite()"
            class="p-2 rounded-full hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
            [class.favorite-active]="line.isFavorite"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
          </button>
        </div>
        <h3 class="font-bold text-lg mb-1">{{ line.name }}</h3>
        <div class="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-6">
          <span class="truncate">{{ line.origin }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
          <span class="truncate">{{ line.destination }}</span>
        </div>
        <button
          (click)="onViewDetails()"
          class="w-full bg-[var(--bg-input)] group-hover:bg-[var(--primary)] group-hover:text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Ver Detalhes
        </button>
      </div>
    }
  `,
})
export class LineCardComponent {
  @Input() line!: BusLine;
  @Input() compact = false;
  @Input() favoriteActive = false;
  @Input() favoriteDisabled = false;
  @Output() viewDetails = new EventEmitter<BusLine>();
  @Output() toggleFavorite = new EventEmitter<BusLine>();

  onViewDetails() {
    this.viewDetails.emit(this.line);
  }

  onToggleFavorite() {
    this.toggleFavorite.emit(this.line);
  }
}
