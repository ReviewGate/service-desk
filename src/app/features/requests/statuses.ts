import { RequestStatus } from '../../core/models';

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  waiting: 'Ждём клиента',
  done: 'Закрыта',
  rejected: 'Отклонена',
};

/** Порядок как в жизни: от свежей заявки к закрытой. */
export const STATUS_ORDER: readonly RequestStatus[] = [
  'new',
  'in_progress',
  'waiting',
  'done',
  'rejected',
];
