import React from 'react';
import RRule, { ByWeekday, Frequency, Weekday } from 'rrule';
import { Repeater } from '../../rrule-adapter';

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
  repeater: Repeater;
  setRepeater: React.Dispatch<React.SetStateAction<Repeater>>;
}> = (props): JSX.Element => {
  if (
    !props.repeater ||
    !props.repeater.rrule ||
    props.repeater.rrule.origOptions.freq !== Frequency.WEEKLY
  ) {
    return null;
  }

  const toggleSelected = (id: number) => {
    const dow = getDaysOfWeek(props.repeater.rrule);
    if (dow.includes(id)) {
      props.setRepeater(
        withDaysOfWeek(
          dow.filter((n) => n !== id),
          props.repeater,
        ),
      );
    } else {
      dow.push(id);
      props.setRepeater(withDaysOfWeek(dow, props.repeater));
    }
  };

  return (
    <div>
      {weekdays.map(({ id, text }) => {
        return (
          <button
            key={id}
            className={isDaySelected(id, props.repeater.rrule) ? 'mod-cta' : ''}
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

const withDaysOfWeek = (ids: number[], repeater: Repeater): Repeater => {
  const weekdayList: Weekday[] = new Array(ids.length);
  const numberList: number[] = new Array(ids.length);

  for (let i = 0; i < ids.length; i++) {
    weekdayList[i] = new Weekday(ids[i]);
    numberList[i] = ids[i];
  }

  return repeater.modify((rrule: RRule) => {
    rrule.origOptions.byweekday = weekdayList;
    rrule.options.byweekday = numberList;
  });
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
