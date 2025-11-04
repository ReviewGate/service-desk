import { Pipe, PipeTransform } from '@angular/core';

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

    if (digits.length !== 11) {
      return value;
    }

    const [, code, a, b, c] = /^.(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits) ?? [];

    return `+7 (${code}) ${a}-${b}-${c}`;
  }
}
