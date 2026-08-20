import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { ROUTE_REQUESTS } from '../../app.routes';
import { RequestStatus, ServiceRequest } from '../../core/models';
import { PhonePipe } from '../../shared/phone.pipe';
import { STATUS_LABELS, STATUS_ORDER } from './statuses';
import { StatusBadgeComponent } from './status-badge.component';

/** Итог одного поискового запроса: нет фильтра / ищем / нашли / не получилось. */
type SearchOutcome =
  | { kind: 'idle' }
  | { kind: 'searching' }
  | { kind: 'found'; items: ServiceRequest[]; at: Date }
  | { kind: 'error' };

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

  /** Что менеджер набрал в поиске и какой статус выбрал. */
  protected readonly query = signal('');
  protected readonly statusFilter = signal<RequestStatus | 'all'>('all');

  private readonly searchParams = computed(() => ({
    query: this.query().trim(),
    status: this.statusFilter(),
  }));

  /** Итог последнего поиска; idle — фильтр не применён, показываем полный список. */
  protected readonly search = signal<SearchOutcome>({ kind: 'idle' });

  protected readonly found = computed(() => {
    const outcome = this.search();

    return outcome.kind === 'found' ? outcome : null;
  });

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

    // Один поток на оба поля: пауза после ввода, без повторов, свежий запрос
    // отменяет предыдущий — ответы не гоняются наперегонки.
    toObservable(this.searchParams)
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.query === b.query && a.status === b.status),
        switchMap((params) => this.runSearch(params)),
        takeUntilDestroyed(),
      )
      .subscribe((outcome) => this.search.set(outcome));
  }

  protected onQueryInput(value: string): void {
    this.query.set(value);
  }

  protected onStatusFilter(value: string): void {
    this.statusFilter.set(value as RequestStatus | 'all');
  }

  protected onResetFilters(): void {
    this.query.set('');
    this.statusFilter.set('all');
  }

  private runSearch(params: { query: string; status: RequestStatus | 'all' }) {
    if (!params.query && params.status === 'all') {
      return of<SearchOutcome>({ kind: 'idle' });
    }

    return this.api.searchRequests(params.query, params.status).pipe(
      map((items): SearchOutcome => ({ kind: 'found', items, at: new Date() })),
      catchError(() => of<SearchOutcome>({ kind: 'error' })),
      // Пока ответа нет — состояние «ищем»: менеджер видит, что запрос в пути.
      startWith<SearchOutcome>({ kind: 'searching' }),
    );
  }
}
