import { Component, inject } from '@angular/core';
import { PwaService } from '../../../core/services/pwa.service';

@Component({
  selector: 'app-pwa-status',
  standalone: true,
  template: `
    @if (pwa.offline()) {
      <div class="app-notice" role="status">
        Você está offline. A interface continua disponível; login, linhas e posições dos ônibus
        precisam de conexão.
      </div>
    }
    @if (pwa.updateAvailable()) {
      <div class="app-notice" role="status">
        <span
          >Uma nova versão está pronta. Atualizar recarrega a página; conclua seus formulários
          antes.</span
        >
        <button
          type="button"
          class="button-secondary"
          [disabled]="pwa.offline()"
          (click)="pwa.reload()"
        >
          Atualizar agora
        </button>
      </div>
    }
    @if (pwa.installError()) {
      <p class="app-notice" role="alert">{{ pwa.installError() }}</p>
    }
  `,
})
export class PwaStatusComponent {
  readonly pwa = inject(PwaService);
}
