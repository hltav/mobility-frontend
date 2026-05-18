import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type?: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSignal = signal<ToastMessage | null>(null);

  readonly toast = this.toastSignal.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info') {
    this.toastSignal.set({ message, type });
    setTimeout(() => {
      if (this.toastSignal()?.message === message) {
        this.toastSignal.set(null);
      }
    }, 3000);
  }

  hide() {
    this.toastSignal.set(null);
  }
}
