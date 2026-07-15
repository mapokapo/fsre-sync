const ISO_WEEK_PATTERN = /^(\d{4})-W(\d{2})$/;

export class YearWeek {
  constructor(
    public readonly year: number,
    public readonly week: number
  ) {}

  static fromDate(date: Date): YearWeek {
    const { week, year } = getIsoWeekAndYear(date);
    return new YearWeek(year, week);
  }

  static now(): YearWeek {
    return YearWeek.fromDate(new Date());
  }

  static parse(value: string): YearWeek {
    const match = ISO_WEEK_PATTERN.exec(value);
    if (!match) {
      throw new RangeError(`Invalid ISO week: ${value}`);
    }
    return new YearWeek(Number(match[1]), Number(match[2]));
  }

  /** Monday = 1, Sunday = 7 */
  atDay(dayOfWeek: number): Date {
    const monday = getMondayOfIsoWeek(this.year, this.week);
    return new Date(monday.getTime() + (dayOfWeek - 1) * 86_400_000);
  }

  getWeek(): number {
    return this.week;
  }

  getYear(): number {
    return this.year;
  }

  plusWeeks(weeks: number): YearWeek {
    const monday = this.atDay(1);
    monday.setUTCDate(monday.getUTCDate() + weeks * 7);
    return YearWeek.fromDate(monday);
  }

  toString(): string {
    return `${this.year.toString()}-W${this.week.toString().padStart(2, "0")}`;
  }
}

function getIsoWeekAndYear(date: Date): { week: number; year: number } {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const year = utcDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7
  );
  return { week, year };
}

function getMondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);
  const monday = new Date(mondayOfWeek1);
  monday.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7);
  return monday;
}
