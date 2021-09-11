import RRule from 'rrule';

export class Repeater {
  public rrule: RRule | undefined;

  constructor(repeatConfig: string) {
    this.rrule = repeatConfig !== '' ? RRule.fromText(repeatConfig) : undefined;
  }

  public repeats = (): boolean => this.rrule !== undefined;

  public toText = (): string => {
    if (!this.rrule.isFullyConvertibleToText()) {
      throw new Error('tq: Unable to convert repeat config to text');
    }
    return this.rrule.toText();
  };

  public modify = (fn: (rrule: RRule) => void): Repeater => {
    const clone = RRule.fromText(this.toText());
    fn(clone);
    return new Repeater(clone.toText());
  };
}

export const NewDefaultRepeater = (): Repeater => new Repeater('every day');
