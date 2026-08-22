import { Pipe, PipeTransform } from '@angular/core';

/** Российский номер — 11 цифр; всё остальное не форматируем и не набираем. */
const RU_PHONE_LENGTH = 11;

/**
 * Телефон в машинном виде для tel:-ссылки: +7XXXXXXXXXX. Правило то же, что у sdPhone,
 * чтобы набираемый номер совпадал с показанным: для «8 (999) 123-45-67» — tel:+79991234567.
 * Кривой номер менеджер видит как есть, но кнопки звонка под ним нет.
 */
export function toTelHref(value: string | null | undefined): string | null {
  const digits = value?.replace(/\D/g, '') ?? '';

  return digits.length === RU_PHONE_LENGTH ? `tel:+7${digits.slice(1)}` : null;
}

/**
 * Телефон в человеческом виде: +7 (999) 123-45-67.
 * Всё, что не похоже на российский номер из 11 цифр, отдаём как есть —
 * менеджеру полезнее увидеть кривой номер, чем аккуратно отформатированную ложь.
 */
@Pipe({ name: 'sdPhone' })
export class PhonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const digits = value.replace(/\D/g, '');

    if (digits.length !== RU_PHONE_LENGTH) {
      return value;
    }

    const [, code, a, b, c] = /^.(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits) ?? [];

    return `+7 (${code}) ${a}-${b}-${c}`;
  }
}
