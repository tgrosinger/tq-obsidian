import { dump, load } from 'js-yaml';
import RRule from 'rrule';

export class Frontmatter {
  // TODO: Use index signatures?
  // [s: string]: any

  private readonly lines: string[];
  private start: number;
  private end: number;
  private contents: { [k: string]: any };

  constructor(lines: string[]) {
    this.lines = lines;
    this.initBoundaries();
    this.parse();
  }

  public readonly contains = (key: string): boolean => key in this.contents;
  public readonly get = (key: string): any => this.contents[key];
  public readonly set = (key: string, value: any): void =>
    (this.contents[key] = value);

  public readonly overwrite = (): void => {
    const replacer = (k: string, v: any): any =>
      k === 'due' ? window.moment(v).endOf('day').format('YYYY-MM-DD') : v;
    const fmLines = dump(this.contents, { replacer }).trim();
    this.lines.splice(this.start, this.end - this.start + 1, fmLines);
  };

  private readonly initBoundaries = (): void => {
    this.start = this.lines.findIndex((line) => line === '---') + 1;
    if (this.start === 0) {
      console.debug('tq: No frontmatter found for note');
      this.start = -1;
      this.end = -1;
      return;
    }

    this.end =
      this.lines.slice(this.start).findIndex((line) => line === '---') +
      this.start -
      1;
  };

  private readonly parse = (): void => {
    if (this.start < 0 || this.end < this.start) {
      this.contents = {};
      return;
    }

    const fmLines = this.lines.slice(this.start, this.end + 1).join('\n');
    const fm = load(fmLines);

    if (typeof fm === 'string' || typeof fm === 'number') {
      throw new Error('tq: Unexpected type of frontmatter');
    }

    this.contents = fm;
  };
}

export const setCompleted = (frontmatter: Frontmatter): void => {
  // Add the current date to the 'completed' frontmatter
  const today = window.moment().format('YYYY-MM-DD');
  if (!frontmatter.contains('completed')) {
    frontmatter.set('completed', [today]);
    return;
  }

  const cur = frontmatter.get('completed');
  if (typeof cur === 'string') {
    frontmatter.set('completed', [cur, today]);
  } else if (Array.isArray(cur)) {
    cur.push(today);
  } else {
    console.warn('tq: Unexpected type for completed field in frontmatter');
  }
};

export const setDueDate = (frontmatter: Frontmatter): void => {
  const repeatConfig = frontmatter.get('repeat');
  const repeater = RRule.fromText(repeatConfig);
  const next = repeater.after(window.moment.utc().endOf('day').toDate());
  const due = window.moment(next).startOf('day').toDate();
  frontmatter.set('due', due);
};
