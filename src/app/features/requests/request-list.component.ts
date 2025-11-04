import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { ROUTE_REQUESTS } from '../../app.routes';
import { PhonePipe } from '../../shared/phone.pipe';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'sd-request-list',
  imports: [AsyncPipe, DatePipe, RouterLink, PhonePipe, StatusBadgeComponent],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestListComponent {
  private readonly api = inject(ApiService);

  protected readonly requests$ = this.api.requests$;
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  protected readonly routeRequests = ROUTE_REQUESTS;

  constructor() {
    this.api
      .loadRequests()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.isLoading.set(false),
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Не удалось загрузить заявки. Обновите страницу.');
        },
      });
  }
}
