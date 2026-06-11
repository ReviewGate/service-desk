import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { User } from '../../core/models';

/**
 * Экран сотрудников — первая фича, сделанная целиком на сигналах.
 * Дальше по проекту хочу так же, старое переезжает постепенно.
 */
@Component({
  selector: 'sd-users',
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly api = inject(ApiService);

  private readonly loadFailed = signal(false);

  private readonly users = toSignal(
    this.api.getUsers().pipe(
      catchError(() => {
        this.loadFailed.set(true);

        return of<User[]>([]);
      }),
    ),
    { initialValue: undefined },
  );

  protected readonly withInactive = signal(false);

  protected readonly isLoading = computed(() => this.users() === undefined);
  protected readonly hasError = this.loadFailed.asReadonly();

  protected readonly visibleUsers = computed(() => {
    const all = this.users() ?? [];

    return this.withInactive() ? all : all.filter((user) => user.isActive);
  });

  protected onToggleInactive(): void {
    this.withInactive.update((value) => !value);
  }
}
