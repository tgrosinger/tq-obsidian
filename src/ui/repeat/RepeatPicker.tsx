import React from 'react';
import RRule, { Frequency } from 'rrule';
import { DaysOfWeekSelector } from './DaysOfWeekSelector';
import { DaysOfMonthSelector } from './DaysOfMonthSelector';
import { MonthsOfYearSelector } from './MonthsOfYearSelector';
import { FrequencySelector } from './FrequencySelector';

// Repetition types:
// - Daily with interval
// - Weekly with weekday selector and interval
// - Monthly with day of month selctor (including "last day") and interval
// - Monthly with [1-5, last], weekday selector, and interval
// - Yearly with month selector, [1-5, last], weekday selector, and interval
// - All of the above with:
//   - "Until..."
//   - "For ... occurences"

// Tips:
// - day of month can be selected with negatives (-1 = last day)
// - multiple days of month can be selected (15,-1)
// - nth weekday is represented as '1FR' or '-1SU'
// - Lots more examples: https://www.kanzaki.com/docs/ical/rrule.html

export const RepeatPicker: React.FC<{
  repeats: boolean;
  setRepeats: React.Dispatch<React.SetStateAction<boolean>>;
  repeatConfig: string;
  setRepeatConfig: React.Dispatch<React.SetStateAction<string>>;
}> = ({ repeats, setRepeats, repeatConfig, setRepeatConfig }): JSX.Element => {
  // TODO: Rather than RepeatAdapter, use a series of functions which take a repeat config and return a modified repeat config.
  // Individual action controls could be sub-components?

  const [rrule, setRrule] = React.useState<RRule>();
  React.useEffect(() => {
    if (repeatConfig === '') {
      setRrule(new RRule({ freq: Frequency.WEEKLY, interval: 1 }));
    } else {
      setRrule(RRule.fromText(repeatConfig));
    }
  }, [repeatConfig]);

  const repeatSelector = (
    <>
      <FrequencySelector rrule={rrule} setRepeatConfig={setRepeatConfig} />
      <DaysOfWeekSelector rrule={rrule} setRepeatConfig={setRepeatConfig} />
      <MonthsOfYearSelector rrule={rrule} setRepeatConfig={setRepeatConfig} />
      <DaysOfMonthSelector rrule={rrule} setRepeatConfig={setRepeatConfig} />
    </>
  );

  return (
    <div>
      <div>
        <label>
          Repeats
          <input
            type="checkbox"
            checked={repeats}
            onChange={(e) => {
              setRepeats(e.target.checked);
              setRepeatConfig(e.target.checked ? toString(rrule) : '');
            }}
          />
        </label>

        {repeats ? repeatSelector : null}
        <span>{repeatConfig}</span>
      </div>
    </div>
  );
};

const toString = (rrule: RRule): string =>
  rrule.isFullyConvertibleToText() ? rrule.toText() : rrule.toString();
