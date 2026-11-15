import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ThemeService } from '../../core/services/theme.service';
import { TEST_LINES } from '../../../testing/fixtures/transit.fixture';

function setup(unavailable = false) {
  const auth = {
    getUser: () => ({ name: 'Hudson Tavares', email: 'hudson@example.com' }),
    logout: vi.fn(),
  };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: auth },
      {
        provide: FavoritesService,
        useValue: {
          getFavorites: () =>
            unavailable ? throwError(() => new Error('offline')) : of(TEST_LINES),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(ProfileComponent);
  fixture.detectChanges();
  return { fixture, auth };
}

describe('Profile page', () => {
  it('renders the account and actual favorite count without invented activity statistics', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Hudson Tavares');
    expect(fixture.nativeElement.querySelector('.profile-avatar').textContent).toBe('HT');
    expect(fixture.nativeElement.querySelector('.profile-account p').textContent).toBe(
      'hudson@example.com',
    );
    expect(fixture.nativeElement.querySelector('.profile-badges')).toBeNull();
    expect(fixture.nativeElement.querySelector('.profile-header').textContent).not.toContain(
      'Free',
    );
    expect(fixture.nativeElement.querySelector('.profile-header').textContent).not.toContain(
      'Navegador',
    );
    expect(
      [...fixture.nativeElement.querySelectorAll('dd')].map((item: any) => item.textContent.trim()),
    ).toEqual(['3', '—', '—']);
    expect(fixture.nativeElement.textContent).not.toContain('Instalado');
  });
  it('keeps the light header treatment and both theme selectors synchronized', () => {
    const { fixture } = setup();
    const theme = TestBed.inject(ThemeService);
    theme.set('light');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-light')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.profile-theme-options [aria-pressed="true"]')
        .textContent,
    ).toContain('Light');
    fixture.nativeElement.querySelector('[aria-label="Selecionar tema Escuro"]').click();
    fixture.detectChanges();
    expect(theme.theme()).toBe('dark');
    expect(fixture.nativeElement.querySelector('.profile-light')).toBeNull();
    expect(
      fixture.nativeElement
        .querySelector('[aria-label="Tema escuro"]')
        .getAttribute('aria-pressed'),
    ).toBe('true');
    theme.set('system');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.profile-theme-options [aria-pressed="true"]')
        .textContent,
    ).toContain('System');
  });
  it('does not report zero favorites when the API is unavailable and logs out using the existing auth integration', () => {
    const { fixture, auth } = setup(true);
    expect(fixture.nativeElement.querySelector('dd').textContent).toBe('—');
    fixture.nativeElement.querySelector('.profile-logout').click();
    expect(auth.logout).toHaveBeenCalledOnce();
  });
  it('não apresenta estatísticas demonstrativas e usa o logout oficial', () => {
    const { fixture, auth } = setup();
    expect(fixture.nativeElement.querySelector('.profile-demo')).toBeNull();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Hudson Tavares');
    expect(fixture.nativeElement.querySelector('.profile-account p').textContent).toBe(
      'hudson@example.com',
    );
    expect(fixture.nativeElement.textContent).not.toContain('24 buscas de exemplo');
    fixture.nativeElement.querySelector('.profile-logout').click();
    expect(auth.logout).toHaveBeenCalledOnce();
  });
});
