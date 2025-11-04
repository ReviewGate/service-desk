import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { RequestStatus } from '../../core/models';
import { STATUS_LABELS } from './statuses';

@Component({
  selector: 'sd-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge--' + status()">{{ label() }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 13px;
      background: #eef1f5;
      color: #3d4757;
    }

    .badge--new {
      background: #e6f0ff;
      color: #1d4ed8;
    }

    .badge--in_progress {
      background: #fff3d6;
      color: #92600a;
    }

    .badge--done {
      background: #e5f6ea;
      color: #1c6b34;
    }

    .badge--rejected {
      background: #fbe6e6;
      color: #a11d1d;
    }
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<RequestStatus>();

  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
}
