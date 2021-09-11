import React from 'react';
import { DaysOfWeekSelector } from './DaysOfWeekSelector';
import { DaysOfMonthSelector } from './DaysOfMonthSelector';
import { MonthsOfYearSelector } from './MonthsOfYearSelector';
import { FrequencySelector } from './FrequencySelector';
import { NewDefaultRepeater, Repeater } from '../../rrule-adapter';

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
  repeater: Repeater;
  setRepeater: React.Dispatch<React.SetStateAction<Repeater>>;
}> = (props): JSX.Element => {
  // TODO: Add interval selector ("Every 3 days", "Every 3 weeks")
  const repeatSelector = (
    <>
      <FrequencySelector
        repeater={props.repeater}
        setRepeater={props.setRepeater}
      />
      <DaysOfWeekSelector
        repeater={props.repeater}
        setRepeater={props.setRepeater}
      />
      <MonthsOfYearSelector
        repeater={props.repeater}
        setRepeater={props.setRepeater}
      />
      <DaysOfMonthSelector
        repeater={props.repeater}
        setRepeater={props.setRepeater}
      />
    </>
  );

  return (
    <div>
      <div>
        <label>
          Repeats
          <input
            type="checkbox"
            checked={props.repeater ? props.repeater.repeats() : false}
            onChange={(e) => {
              props.setRepeater(
                e.target.checked ? NewDefaultRepeater() : undefined,
              );
            }}
          />
        </label>

        {props.repeater && props.repeater.repeats() ? repeatSelector : null}
        <span>{props.repeater ? props.repeater.toText() : ''}</span>
      </div>
    </div>
  );
};
