import { Routes } from '@angular/router';
import { PREVIEW_PROVIDERS } from './preview-services';

export const PREVIEW_ROUTES: Routes = [
  {
    path: '',
    providers: PREVIEW_PROVIDERS,
    data: { preview: true },
    children: [
      {
        path: 'profile',
        title: 'Prévia do perfil — Mobility',
        loadComponent: () => import('../profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'favorites',
        title: 'Prévia de favoritos — Mobility',
        loadComponent: () =>
          import('../favorites/favorites.component').then((m) => m.FavoritesComponent),
      },
      {
        path: 'stops',
        title: 'Prévia de paradas próximas — Mobility',
        loadComponent: () =>
          import('../nearby-stops/nearby-stops.component').then((m) => m.NearbyStopsComponent),
      },
      {
        path: 'map',
        title: 'Prévia do mapa — Mobility',
        loadComponent: () => import('../map/map-page.component').then((m) => m.MapPageComponent),
      },
      {
        path: 'home',
        title: 'Prévia da home — Mobility',
        loadComponent: () => import('../home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'search',
        title: 'Prévia da busca — Mobility',
        loadComponent: () => import('../search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'lines/:id',
        title: 'Detalhes de exemplo — Mobility',
        loadComponent: () =>
          import('../line-details/line-details.component').then((m) => m.LineDetailsComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'search' },
    ],
  },
];
