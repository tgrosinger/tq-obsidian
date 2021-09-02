import React from 'react';
import RRule, { ByWeekday, Frequency, Weekday } from 'rrule';

const weekdays = [
  { id: 6, text: 'S' },
  { id: 0, text: 'M' },
  { id: 1, text: 'T' },
  { id: 2, text: 'W' },
  { id: 3, text: 'T' },
  { id: 4, text: 'F' },
  { id: 5, text: 'S' },
];

export const DaysOfWeekSelector: React.FC<{
  rrule: RRule;
  setRepeatConfig: React.Dispatch<React.SetStateAction<string>>;
}> = ({ rrule, setRepeatConfig }): JSX.Element => {
  if (!rrule || rrule.origOptions.freq !== Frequency.WEEKLY) {
    return null;
  }

  const toggleSelected = (id: number) => {
    const dow = getDaysOfWeek(rrule);
    if (dow.includes(id)) {
      setRepeatConfig(
        withDaysOfWeek(
          dow.filter((n) => n !== id),
          rrule,
        ),
      );
    } else {
      dow.push(id);
      setRepeatConfig(withDaysOfWeek(dow, rrule));
    }
  };

  return (
    <div>
      {weekdays.map(({ id, text }) => {
        return (
          <button
            key={id}
            className={isDaySelected(id, rrule) ? 'mod-cta' : ''}
            onClick={() => {
              toggleSelected(id);
            }}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
};

const withDaysOfWeek = (ids: number[], rrule: RRule): string => {
  const weekdayList: Weekday[] = new Array(ids.length);
  const numberList: number[] = new Array(ids.length);

  for (let i = 0; i < ids.length; i++) {
    weekdayList[i] = new Weekday(ids[i]);
    numberList[i] = ids[i];
  }

  rrule.origOptions.byweekday = weekdayList;
  rrule.options.byweekday = numberList;

  return toString(rrule);
};

const getDaysOfWeek = (rrule: RRule): number[] => {
  const weekdays = rrule.origOptions.byweekday;
  if (!weekdays) {
    return [];
  } else if (Array.isArray(weekdays)) {
    return weekdays.map(byWeekdayToNumber);
  }
  return [byWeekdayToNumber(weekdays)];
};

const isDaySelected = (id: number, rrule: RRule): boolean =>
  getDaysOfWeek(rrule).includes(id);

const byWeekdayToNumber = (wd: ByWeekday): number => {
  if (typeof wd === 'number') {
    return wd;
  } else if (typeof wd === 'string') {
    return 0; // TODO
  }
  return wd.weekday;
};

const toString = (rrule: RRule): string =>
  rrule.isFullyConvertibleToText() ? rrule.toText() : rrule.toString();
