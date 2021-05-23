import { dump, load } from 'js-yaml';
import RRule from 'rrule';

export class Frontmatter {
  // TODO: Use index signatures?
  // [s: string]: any

  private lines: string[];
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
  public readonly set = (key: string, value: any) =>
    (this.contents[key] = value);

  public readonly overwrite = () => {
    const fmLines = dump(this.contents).trim();
    this.lines.splice(this.start, this.end - this.start + 1, fmLines);
  };

  private readonly initBoundaries = () => {
    this.start = this.lines.findIndex((line) => line === '---') + 1;
    if (this.start === 0) {
      throw new Error('tq: Unable to find frontmatter');
    }

    this.end =
      this.lines.slice(this.start).findIndex((line) => line === '---') +
      this.start -
      1;
  };

  private readonly parse = () => {
    const fmLines = this.lines.slice(this.start, this.end + 1).join('\n');
    console.log(fmLines);
    const fm = load(fmLines);

    if (typeof fm === 'string' || typeof fm === 'number') {
      throw new Error('tq: Unexpected type of frontmatter');
    }

    this.contents = fm;
  };
}

export const setCompleted = (frontmatter: Frontmatter) => {
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

export const setDueDate = (frontmatter: Frontmatter) => {
  const repeatConfig = frontmatter.get('repeat');
  const repeater = RRule.fromText(repeatConfig);
  const next = repeater.after(window.moment().endOf('day').toDate());
  const due = window.moment(next).startOf('day').format('YYYY-MM-DD');
  frontmatter.set('due', due);
};
