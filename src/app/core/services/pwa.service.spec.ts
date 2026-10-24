import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { PwaService } from './pwa.service';

describe('PWA lifecycle', () => {
  const versions = new Subject<{ type: string }>();
  const broken = new Subject<unknown>();
  const updates = {
    isEnabled: true,
    versionUpdates: versions,
    unrecoverable: broken,
    checkForUpdate: vi.fn().mockResolvedValue(false),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: SwUpdate, useValue: updates }] });
  });
  it('shows network availability without substituting stale realtime data', () => {
    const service = TestBed.inject(PwaService);
    window.dispatchEvent(new Event('offline'));
    expect(service.offline()).toBe(true);
    window.dispatchEvent(new Event('online'));
    expect(service.offline()).toBe(false);
    expect(updates.checkForUpdate).toHaveBeenCalled();
  });
  it('offers an update only after the worker has downloaded the new version', () => {
    const service = TestBed.inject(PwaService);
    versions.next({ type: 'VERSION_DETECTED' });
    expect(service.updateAvailable()).toBe(false);
    versions.next({ type: 'VERSION_READY' });
    expect(service.updateAvailable()).toBe(true);
  });
  it('exposes install only after a genuine browser prompt, and handles dismissal', async () => {
    const service = TestBed.inject(PwaService);
    expect(service.installAvailable()).toBe(false);
    const event = new Event('beforeinstallprompt', { cancelable: true });
    const prompt = vi.fn().mockResolvedValue(undefined);
    Object.defineProperties(event, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: 'dismissed' }) },
    });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(service.installAvailable()).toBe(true);
    await service.install();
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(service.installAvailable()).toBe(false);
  });
  it('releases network and update listeners on destruction', () => {
    const service = TestBed.inject(PwaService);
    TestBed.resetTestingModule();
    window.dispatchEvent(new Event('offline'));
    expect(service.offline()).toBe(false);
    versions.next({ type: 'VERSION_READY' });
    expect(service.updateAvailable()).toBe(false);
  });
});
