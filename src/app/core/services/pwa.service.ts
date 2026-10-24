import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly document = inject(DOCUMENT);
  private readonly updates = inject(SwUpdate, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly prompt = signal<InstallPrompt | null>(null);
  readonly offline = signal(false);
  readonly standalone = signal(false);
  readonly updateAvailable = signal(false);
  readonly installError = signal('');
  readonly installAvailable = computed(() => !!this.prompt() && !this.standalone());

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const win = this.document.defaultView;
    if (!win) return;
    const media = win.matchMedia?.('(display-mode: standalone)');
    this.standalone.set(media?.matches ?? false);
    this.offline.set(!win.navigator.onLine);
    const listen = (target: EventTarget, type: string, callback: EventListener) => {
      target.addEventListener(type, callback);
      this.destroyRef.onDestroy(() => target.removeEventListener(type, callback));
    };
    listen(win, 'offline', () => this.offline.set(true));
    listen(win, 'online', () => {
      this.offline.set(false);
      this.checkForUpdate();
    });
    if (media) listen(media, 'change', () => this.standalone.set(media.matches));
    listen(win, 'beforeinstallprompt', (event) => {
      event.preventDefault();
      this.prompt.set(event as InstallPrompt);
    });
    listen(win, 'appinstalled', () => this.prompt.set(null));
    listen(this.document, 'visibilitychange', () => {
      if (this.document.visibilityState === 'visible') this.checkForUpdate();
    });
    if (this.updates?.isEnabled) {
      this.updates.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        if (event.type === 'VERSION_READY') this.updateAvailable.set(true);
      });
      this.updates.unrecoverable
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateAvailable.set(true));
    }
  }

  async install() {
    const prompt = this.prompt();
    if (!prompt) return;
    this.prompt.set(null);
    this.installError.set('');
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      this.installError.set('Não foi possível abrir a instalação. Use o menu do navegador.');
    }
  }

  reload() {
    if (!this.offline()) this.document.defaultView?.location.reload();
  }

  private checkForUpdate() {
    if (this.updates?.isEnabled && !this.offline())
      void this.updates.checkForUpdate().catch(() => undefined);
  }
}
