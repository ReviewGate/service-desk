import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { RequestComment, RequestStatus, ServiceRequest, User } from './models';

/**
 * Всё общение с бэкендом. Писалось в самом начале, поэтому список заявок держится
 * в BehaviorSubject: тогда сигналов ещё не было, а переписывать работающее без
 * повода не хочется.
 *
 * TODO: перевести на сигналы, как сделано в settings/users.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly requestsSubject = new BehaviorSubject<ServiceRequest[]>([]);

  /** Текущий список заявок. Обновляется после loadRequests() и смены статуса. */
  readonly requests$ = this.requestsSubject.asObservable();

  loadRequests(): Observable<ServiceRequest[]> {
    return this.http
      .get<ServiceRequest[]>('/api/requests')
      .pipe(tap((items) => this.requestsSubject.next(items)));
  }

  getRequest(id: number): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`/api/requests/${id}`);
  }

  changeStatus(id: number, status: RequestStatus): Observable<ServiceRequest> {
    return this.http
      .patch<ServiceRequest>(`/api/requests/${id}`, { status })
      .pipe(tap((updated) => this.replaceInCache(updated)));
  }

  getComments(requestId: number): Observable<RequestComment[]> {
    return this.http.get<RequestComment[]>(`/api/requests/${requestId}/comments`);
  }

  addComment(requestId: number, text: string): Observable<RequestComment> {
    return this.http.post<RequestComment>(`/api/requests/${requestId}/comments`, { text });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getMe(): Observable<User> {
    return this.http.get<User>('/api/me');
  }

  private replaceInCache(updated: ServiceRequest): void {
    const next = this.requestsSubject.value.map((item) =>
      item.id === updated.id ? updated : item,
    );

    this.requestsSubject.next(next);
  }
}
