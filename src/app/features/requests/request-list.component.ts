import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { ROUTE_REQUESTS } from '../../app.routes';
import { RequestStatus, ServiceRequest } from '../../core/models';
import { PhonePipe } from '../../shared/phone.pipe';
import { RequestSearchService } from './request-search.service';
import { STATUS_LABELS, STATUS_ORDER } from './statuses';
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
  private readonly search = inject(RequestSearchService);

  protected readonly requests$ = this.api.requests$;
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  protected readonly routeRequests = ROUTE_REQUESTS;

  /** Что менеджер набрал в поиске и какой статус выбрал. */
  protected readonly query = signal('');
  protected readonly statusFilter = signal<RequestStatus | 'all'>('all');

  /** null — фильтр не применён, показываем полный список. */
  protected readonly found = signal<ServiceRequest[] | null>(null);
  protected readonly foundAt = signal('');

  protected readonly statuses = STATUS_ORDER;
  protected readonly statusLabels = STATUS_LABELS;

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

  protected onQueryInput(value: string): void {
    this.query.set(value);
    this.runSearch();
  }

  protected onStatusFilter(value: string): void {
    this.statusFilter.set(value as RequestStatus | 'all');
    this.runSearch();
  }

  protected onResetFilters(): void {
    this.query.set('');
    this.statusFilter.set('all');
    this.found.set(null);
  }

  private runSearch(): void {
    if (!this.query() && this.statusFilter() === 'all') {
      this.found.set(null);

      return;
    }

    this.search.search(this.query(), this.statusFilter()).subscribe({
      next: (items) => {
        const now = new Date();

        this.found.set(items);
        this.foundAt.set(`${now.getHours()}:${now.getMinutes()}`);
      },
      error: () => this.found.set([]),
    });
  }
}
