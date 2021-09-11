import React from 'react';
import RRule, { Frequency } from 'rrule';
import { Repeater } from '../../rrule-adapter';

export const FrequencySelector: React.FC<{
  repeater: Repeater;
  setRepeater: React.Dispatch<React.SetStateAction<Repeater>>;
}> = (props): JSX.Element => {
  if (!props.repeater || !props.repeater.rrule) {
    return null;
  }

  // Why doesn't this work?
  const interval = props.repeater.rrule.origOptions.interval;

  return (
    <select
      id="frequency-selector"
      value={props.repeater.rrule.origOptions.freq}
      onChange={(e) => {
        props.setRepeater(
          withFrequency(parseInt(e.target.value), props.repeater),
        );
      }}
    >
      <option value={Frequency.DAILY}>{interval > 1 ? 'Days' : 'Day'}</option>
      <option value={Frequency.WEEKLY}>
        {interval > 1 ? 'Weeks' : 'Week'}
      </option>
      <option value={Frequency.MONTHLY}>
        {interval > 1 ? 'Months' : 'Month'}
      </option>
      <option value={Frequency.YEARLY}>
        {interval > 1 ? 'Years' : 'Year'}
      </option>
    </select>
  );
};

const withFrequency = (frequency: number, repeater: Repeater): Repeater => {
  if (
    ![
      Frequency.YEARLY,
      Frequency.MONTHLY,
      Frequency.WEEKLY,
      Frequency.DAILY,
    ].contains(frequency)
  ) {
    throw new Error(`Invalid frequency ${frequency} requested`);
  }

  return repeater.modify((rrule: RRule) => {
    rrule.options.freq = frequency;
    rrule.origOptions.freq = frequency;

    // reset other config options
    rrule.options.bymonth = undefined;
    rrule.origOptions.bymonth = undefined;
    rrule.options.bymonthday = undefined;
    rrule.origOptions.bymonthday = undefined;
    rrule.options.byweekday = undefined;
    rrule.origOptions.byweekday = undefined;
  });
};
