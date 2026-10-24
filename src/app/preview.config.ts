import { Routes } from '@angular/router';

// Replaced by preview.config.prod.ts in production: no demo import reaches that build.
export const PREVIEW_ENABLED = true;
export const PREVIEW_ENTRY_ROUTES: Routes = [
  {
    path: 'preview',
    loadChildren: () => import('./features/preview/preview.routes').then((m) => m.PREVIEW_ROUTES),
  },
];
