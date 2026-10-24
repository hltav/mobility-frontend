import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let listener: (event: MediaQueryListEvent) => void;
  const remove = vi.fn();
  beforeEach(() => {
    localStorage.clear();
    remove.mockClear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: (_type: string, callback: typeof listener) => {
          listener = callback;
        },
        removeEventListener: remove,
      })),
    );
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  it('migrates the existing preference and applies it to the document', () => {
    localStorage.setItem('theme', 'dark');
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('mobility-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('follows live system changes only when system is selected', () => {
    const service = TestBed.inject(ThemeService);
    listener({ matches: true } as MediaQueryListEvent);
    TestBed.tick();
    expect(service.isDark()).toBe(true);
    service.set('light');
    TestBed.tick();
    expect(service.isDark()).toBe(false);
    service.set('system');
    TestBed.tick();
    expect(service.isDark()).toBe(true);
    expect(localStorage.getItem('mobility-theme')).toBe('system');
  });

  it('ignores invalid persisted preferences and releases its listener', () => {
    localStorage.setItem('mobility-theme', 'invalid');
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('system');
    TestBed.resetTestingModule();
    expect(remove).toHaveBeenCalledWith('change', listener);
  });

  it('keeps theme controls usable when storage is blocked', () => {
    const service = TestBed.inject(ThemeService);
    const blocked = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    service.set('dark');
    TestBed.tick();
    expect(service.isDark()).toBe(true);
    blocked.mockRestore();
  });
});
