import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { RequestStatus, ServiceRequest } from '../../core/models';

/**
 * Поиск и фильтр по заявкам.
 *
 * Последнюю выдачу держим у себя: менеджер уходит в карточку и возвращается —
 * и ждёт тот же отфильтрованный список, а не всё заново.
 */
@Injectable({ providedIn: 'root' })
export class RequestSearchService {
  private readonly http = inject(HttpClient);

  private readonly foundSubject = new BehaviorSubject<ServiceRequest[]>([]);

  /** Что нашли в прошлый раз. */
  readonly found$ = this.foundSubject.asObservable();

  search(query: string, status: RequestStatus | 'all'): Observable<ServiceRequest[]> {
    const url = `/api/requests/search?query=${query}&status=${status}`;

    return this.http.get<ServiceRequest[]>(url).pipe(tap((items) => this.foundSubject.next(items)));
  }
}
