import React from 'react';
import RRule, { Frequency } from 'rrule';

const months = [
  { id: 1, text: 'Jan' },
  { id: 2, text: 'Feb' },
  { id: 3, text: 'Mar' },
  { id: 4, text: 'Apr' },
  { id: 5, text: 'May' },
  { id: 6, text: 'Jun' },
  { id: 7, text: 'Jul' },
  { id: 8, text: 'Aug' },
  { id: 9, text: 'Sep' },
  { id: 10, text: 'Oct' },
  { id: 11, text: 'Nov' },
  { id: 12, text: 'Dec' },
];

export const MonthsOfYearSelector: React.FC<{
  rrule: RRule;
  setRepeatConfig: React.Dispatch<React.SetStateAction<string>>;
}> = ({ rrule, setRepeatConfig }): JSX.Element => {
  if (!rrule || rrule.origOptions.freq !== Frequency.YEARLY) {
    return null;
  }

  const toggleSelected = (id: number) => {
    const moy = getMonthsOfYear(rrule);
    if (moy.includes(id)) {
      setRepeatConfig(
        withMonthsOfYear(
          moy.filter((n) => n !== id),
          rrule,
        ),
      );
    } else {
      moy.push(id);
      setRepeatConfig(withMonthsOfYear(moy, rrule));
    }
  };

  return (
    <div>
      {months.map(({ id, text }) => {
        return (
          <button
            key={id}
            className={isMonthSelected(id, rrule) ? 'mod-cta' : ''}
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

const getMonthsOfYear = (rrule: RRule): number[] => {
  const months = rrule.origOptions.bymonth;
  if (months === undefined) {
    return [];
  }
  if (typeof months === 'number') {
    return [months];
  }
  return months;
};

const withMonthsOfYear = (ids: number[], rrule: RRule): string => {
  rrule.origOptions.bymonth = ids;
  rrule.options.bymonth = rrule.origOptions.bymonth;

  // TODO: There's a bug if all months are deselected

  // TODO: Sort

  return toString(rrule);
};

const isMonthSelected = (id: number, rrule: RRule): boolean =>
  getMonthsOfYear(rrule).includes(id);

const toString = (rrule: RRule): string =>
  rrule.isFullyConvertibleToText() ? rrule.toText() : rrule.toString();
