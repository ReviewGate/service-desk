import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './core/auth.service';
import { ROUTE_REQUESTS, ROUTE_SETTINGS_USERS } from './app.routes';

@Component({
  selector: 'sd-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly isAdmin = this.auth.isAdmin;

  protected readonly routeRequests = ROUTE_REQUESTS;
  protected readonly routeUsers = ROUTE_SETTINGS_USERS;
}
