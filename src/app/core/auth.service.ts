import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ApiService } from './api.service';

/**
 * Кто сейчас в панели. Роль нужна, чтобы не показывать менеджеру админские экраны.
 *
 * Права всерьёз проверяет бэкенд — здесь только внешний вид. Скрытая кнопка
 * защитой не является, см. docs/conventions.md.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  readonly user = toSignal(this.api.getMe().pipe(catchError(() => of(null))), {
    initialValue: null,
  });

  readonly isAdmin = computed(() => this.user()?.role === 'admin');
}
