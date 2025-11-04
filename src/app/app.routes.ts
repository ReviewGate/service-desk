import { Routes } from '@angular/router';

/** Пути собираем из констант: строкой в шаблоне легко разъехаться с роутером. */
export const ROUTE_REQUESTS = 'requests';

export const routes: Routes = [
  { path: '', redirectTo: ROUTE_REQUESTS, pathMatch: 'full' },
  {
    path: ROUTE_REQUESTS,
    title: 'Заявки',
    loadComponent: () =>
      import('./features/requests/request-list.component').then((m) => m.RequestListComponent),
  },
  { path: '**', redirectTo: ROUTE_REQUESTS },
];
