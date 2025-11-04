import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { ServiceRequest } from './models';

/**
 * Всё общение с бэкендом. Список заявок держим в BehaviorSubject — экранов,
 * которым он нужен, будет больше одного.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly requestsSubject = new BehaviorSubject<ServiceRequest[]>([]);

  /** Текущий список заявок. Обновляется после loadRequests(). */
  readonly requests$ = this.requestsSubject.asObservable();

  loadRequests(): Observable<ServiceRequest[]> {
    return this.http
      .get<ServiceRequest[]>('/api/requests')
      .pipe(tap((items) => this.requestsSubject.next(items)));
  }
}
