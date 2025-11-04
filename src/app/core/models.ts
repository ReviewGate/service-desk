export type RequestStatus = 'new' | 'in_progress' | 'waiting' | 'done' | 'rejected';

export interface ServiceRequest {
  id: number;
  /** Человеческий номер заявки — то, что менеджер диктует клиенту по телефону. */
  number: string;
  clientName: string;
  clientPhone: string;
  subject: string;
  status: RequestStatus;
  assigneeId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestComment {
  id: number;
  requestId: number;
  authorName: string;
  text: string;
  createdAt: string;
}

export type UserRole = 'manager' | 'admin';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  isActive: boolean;
}
