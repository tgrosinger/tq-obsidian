import React from 'react';
import RRule, { Frequency } from 'rrule';

export const FrequencySelector: React.FC<{
  rrule: RRule;
  setRepeatConfig: React.Dispatch<React.SetStateAction<string>>;
}> = ({ rrule, setRepeatConfig }): JSX.Element => {
  if (!rrule) {
    return null;
  }

  return (
    <select
      id="frequency-selector"
      value={rrule.origOptions.freq}
      onChange={(e) => {
        setRepeatConfig(withFrequency(parseInt(e.target.value), rrule));
      }}
    >
      <option value={Frequency.DAILY}>
        {rrule.origOptions.interval > 1 ? 'Days' : 'Day'}
      </option>
      <option value={Frequency.WEEKLY}>
        {rrule.origOptions.interval > 1 ? 'Weeks' : 'Week'}
      </option>
      <option value={Frequency.MONTHLY}>
        {rrule.origOptions.interval > 1 ? 'Months' : 'Month'}
      </option>
      <option value={Frequency.YEARLY}>
        {rrule.origOptions.interval > 1 ? 'Years' : 'Year'}
      </option>
    </select>
  );
};

const withFrequency = (frequency: number, rrule: RRule): string => {
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

  rrule.options.freq = frequency;
  rrule.origOptions.freq = frequency;

  // reset other config options
  rrule.options.bymonth = undefined;
  rrule.origOptions.bymonth = undefined;
  rrule.options.bymonthday = undefined;
  rrule.origOptions.bymonthday = undefined;
  rrule.options.byweekday = undefined;
  rrule.origOptions.byweekday = undefined;

  return toString(rrule);
};

const toString = (rrule: RRule): string =>
  rrule.isFullyConvertibleToText() ? rrule.toText() : rrule.toString();
