import { Routes } from '@angular/router';

/** Пути собираем из констант: строкой в шаблоне легко разъехаться с роутером. */
export const ROUTE_REQUESTS = 'requests';
export const ROUTE_SETTINGS_USERS = 'settings/users';

export const routes: Routes = [
  { path: '', redirectTo: ROUTE_REQUESTS, pathMatch: 'full' },
  {
    path: ROUTE_REQUESTS,
    title: 'Заявки',
    loadComponent: () =>
      import('./features/requests/request-list.component').then((m) => m.RequestListComponent),
  },
  {
    path: `${ROUTE_REQUESTS}/:id`,
    title: 'Заявка',
    loadComponent: () =>
      import('./features/requests/request-card.component').then((m) => m.RequestCardComponent),
  },
  {
    path: ROUTE_SETTINGS_USERS,
    title: 'Сотрудники',
    loadComponent: () =>
      import('./features/settings/users.component').then((m) => m.UsersComponent),
  },
  { path: '**', redirectTo: ROUTE_REQUESTS },
];
