import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { PREVIEW_ENTRY_ROUTES } from './preview.config';

export const routes: Routes = [
  {
    path: 'stops',
    title: 'Paradas próximas — Mobility',
    loadComponent: () =>
      import('./features/nearby-stops/nearby-stops.component').then((m) => m.NearbyStopsComponent),
    canActivate: [authGuard],
  },
  ...PREVIEW_ENTRY_ROUTES,
  {
    path: 'map',
    title: 'Mapa — Mobility',
    loadComponent: () =>
      import('./features/map/map-page.component').then((m) => m.MapPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    title: 'Perfil — Mobility',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'home',
    title: 'Início — Mobility',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    title: 'Entrar — Mobility',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Criar conta — Mobility',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then((m) => m.SearchComponent),
    canActivate: [authGuard],
  },
  {
    path: 'lines/:id',
    loadComponent: () =>
      import('./features/line-details/line-details.component').then((m) => m.LineDetailsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    title: 'Mobility — sua mobilidade em São Paulo',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
