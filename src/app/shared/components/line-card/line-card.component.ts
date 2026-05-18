import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BusLine } from '../../../core/schemas/bus-line.schema';

@Component({
  selector: 'app-line-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group"
    >
      <div class="flex justify-between items-start mb-4">
        <span
          class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg font-bold text-lg"
        >
          {{ line.code }}
        </span>
        <button
          (click)="onToggleFavorite()"
          class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          [class.text-yellow-500]="line.isFavorite"
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
      <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-6">
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
        class="w-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-600 group-hover:text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        Ver Detalhes
      </button>
    </div>
  `,
})
export class LineCardComponent {
  @Input() line!: BusLine;
  @Output() viewDetails = new EventEmitter<BusLine>();
  @Output() toggleFavorite = new EventEmitter<BusLine>();

  onViewDetails() {
    this.viewDetails.emit(this.line);
  }

  onToggleFavorite() {
    this.toggleFavorite.emit(this.line);
  }
}
