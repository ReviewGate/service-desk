import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { RequestComment, RequestStatus, ServiceRequest } from '../../core/models';
import { PhonePipe, toTelHref } from '../../shared/phone.pipe';
import { STATUS_LABELS, STATUS_ORDER } from './statuses';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'sd-request-card',
  imports: [DatePipe, FormsModule, PhonePipe, StatusBadgeComponent],
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestCardComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly request = signal<ServiceRequest | null>(null);
  protected readonly comments = signal<RequestComment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly draft = signal('');

  protected readonly statuses = STATUS_ORDER;
  protected readonly statusLabels = STATUS_LABELS;

  protected readonly clientTelHref = computed(() => toTelHref(this.request()?.clientPhone));

  constructor() {
    // Компонент пересоздаётся на каждой заявке (переиспользования роутов у нас нет),
    // поэтому id достаточно прочитать один раз из снимка.
    const requestId = Number(this.route.snapshot.paramMap.get('id'));

    this.api
      .getRequest(requestId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (found) => {
          this.request.set(found);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Заявка не найдена или недоступна.');
        },
      });

    this.api
      .getComments(requestId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (items) => this.comments.set(items),
        error: () => this.comments.set([]),
      });
  }

  protected onStatusChange(status: RequestStatus): void {
    const current = this.request();

    if (!current || current.status === status) {
      return;
    }

    this.api
      .changeStatus(current.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => this.request.set(updated),
        error: () => this.loadError.set('Статус не сохранился. Попробуйте ещё раз.'),
      });
  }

  protected onCommentSubmit(): void {
    const text = this.draft().trim();
    const current = this.request();

    if (!text || !current) {
      return;
    }

    this.api
      .addComment(current.id, text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comment) => {
          this.comments.update((items) => [...items, comment]);
          this.draft.set('');
        },
        error: () => this.loadError.set('Комментарий не отправился.'),
      });
  }
}
