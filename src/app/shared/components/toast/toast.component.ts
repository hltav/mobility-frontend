import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show()"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-100 animate-in slide-in-from-bottom-10 flex items-center gap-3"
    >
      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
      {{ message() }}
    </div>
  `,
})
export class ToastComponent {
  show = signal(false);
  message = signal('');

  constructor(private toastService: ToastService) {
    effect(() => {
      const toast = this.toastService.toast();
      if (toast) {
        this.message.set(toast.message);
        this.show.set(true);
        setTimeout(() => this.show.set(false), 3000);
      }
    });
  }
}
