import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { FavoritesComponent } from './favorites.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { TEST_LINES } from '../../../testing/fixtures/transit.fixture';

function setup(lines = [{ ...TEST_LINES[0], id: 7, database_id: 7, favorite_id: 91 }]) {
  const service = { getFavorites: vi.fn(() => of(lines)), removeFavorite: vi.fn(() => of({})) };
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: FavoritesService, useValue: service }],
  });
  const fixture = TestBed.createComponent(FavoritesComponent);
  fixture.detectChanges();
  return { fixture, service, component: fixture.componentInstance };
}

describe('Favorites page', () => {
  it('mostra estado vazio com acesso à busca sem linha fictícia', () => {
    const { fixture } = setup([]);
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Favoritos');
    expect(fixture.nativeElement.textContent).toContain('Nenhuma linha favorita ainda');
    expect(fixture.nativeElement.querySelector('.favorite-example').getAttribute('href')).toBe(
      '/search',
    );
  });

  it('opens the internal line ID and deletes the favorite ID, waiting for confirmation', () => {
    const { fixture, service, component } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.nativeElement.querySelector('.favorite-details').click();
    expect(navigate).toHaveBeenCalledWith(['/lines', 7]);
    const request = new Subject<{}>();
    service.removeFavorite.mockReturnValue(request);
    fixture.nativeElement.querySelector('.favorite-remove').click();
    fixture.detectChanges();
    expect(service.removeFavorite).toHaveBeenCalledWith(91);
    expect(component.favorites()).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.favorite-remove').disabled).toBe(true);
    request.next({});
    request.complete();
    fixture.detectChanges();
    expect(component.favorites()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.favorites-empty')).not.toBeNull();
  });

  it('preserves the line if deletion fails and allows retry', () => {
    const { service, component } = setup();
    service.removeFavorite.mockReturnValue(throwError(() => new Error('offline')));
    component.removeFavorite(component.favorites()[0]);
    expect(component.favorites()).toHaveLength(1);
    expect(component.pending()).toBeNull();
  });

  it('renders a retry state on API failure instead of a false empty list', () => {
    const { fixture, service, component } = setup();
    service.getFavorites.mockReturnValue(throwError(() => new Error('offline')));
    component.loadFavorites();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.favorites-empty')).toBeNull();
    service.getFavorites.mockReturnValue(of([]));
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.favorites-empty')).not.toBeNull();
  });

  it('usa a busca oficial no estado vazio mesmo com providers de teste', () => {
    const { fixture } = setup([]);
    expect(fixture.nativeElement.textContent).not.toContain('CALLAO');
    expect(fixture.nativeElement.textContent).not.toContain('146');
    expect(fixture.nativeElement.querySelector('.favorite-example').getAttribute('href')).toBe(
      '/search',
    );
  });
});
