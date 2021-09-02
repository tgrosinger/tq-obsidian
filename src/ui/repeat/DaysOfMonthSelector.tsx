import React from 'react';
import RRule, { Frequency } from 'rrule';

export const DaysOfMonthSelector: React.FC<{
  rrule: RRule;
  setRepeatConfig: React.Dispatch<React.SetStateAction<string>>;
}> = ({ rrule, setRepeatConfig }): JSX.Element => {
  if (
    !rrule ||
    ![Frequency.MONTHLY, Frequency.YEARLY].includes(rrule.origOptions.freq)
  ) {
    return null;
  }

  const [repeatType, setRepeatType] = React.useState('every');
  React.useEffect(() => {
    const t = rrule.origOptions.byweekday ? 'every' : 'onThe';
    if (t !== repeatType) {
      setRepeatType(t);
    }
  }, [rrule.origOptions.byweekday]);

  return (
    <div>
      <select
        value={repeatType}
        onChange={(e) => setRepeatType(e.target.value)}
      >
        <option value="onThe">on the</option>
        <option value="every">every</option>
      </select>
      {repeatType === 'onThe' ? (
        <OnTheSelector rrule={rrule} setRepeatConfig={setRepeatConfig} />
      ) : (
        <EverySelector rrule={rrule} setRepeatConfig={setRepeatConfig} />
      )}
    </div>
  );
};

const OnTheSelector: React.FC<{
  rrule: RRule;
  setRepeatConfig: React.Dispatch<React.SetStateAction<string>>;
}> = ({ rrule, setRepeatConfig }): JSX.Element => {
  if (!rrule) {
    return null;
  }

  let day = rrule.origOptions.bymonthday || '';
  if (Array.isArray(day)) {
    day = day.length > 0 ? day[0] : 1;
  }

  const setLastDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatConfig(withOnTheLast(e.target.checked, rrule));
  };

  const setDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatConfig(withOnThe(parseInt(e.target.value), rrule));
  };

  return (
    <>
      <input
        type="number"
        max="31"
        placeholder="1"
        value={day}
        disabled={day === -1}
        onChange={setDay}
      />
      <label>
        <input type="checkbox" checked={day === -1} onChange={setLastDay} />{' '}
        Last Day
      </label>
    </>
  );
};

const EverySelector: React.FC<{
  rrule: RRule;
  setRepeatConfig: React.Dispatch<React.SetStateAction<string>>;
}> = ({ rrule, setRepeatConfig }): JSX.Element => {
  if (!rrule) {
    return null;
  }

  return (
    <button
      onClick={() => {
        // Default value of every Monday
        setRepeatConfig(withEvery(0, rrule));
      }}
    >
      Set Every
    </button>
  );
};

const withOnTheLast = (lastDay: boolean, rrule: RRule): string => {
  if (lastDay) {
    rrule.origOptions.bymonthday = -1;
    rrule.options.bymonthday = [-1];
  } else {
    rrule.origOptions.bymonthday = undefined;
    rrule.options.bymonthday = undefined;
  }

  rrule.origOptions.byweekday = []; // incompatible with weekdays of month
  return toString(rrule);
};

const withOnThe = (day: number, rrule: RRule): string => {
  console.debug('Setting repeat to day: ' + day);

  rrule.origOptions.bymonthday = day;
  rrule.options.bymonthday = [day];

  rrule.origOptions.byweekday = []; // incompatible with weekdays of month
  return toString(rrule);
};

const withEvery = (day: number, rrule: RRule): string => {
  rrule.origOptions.byweekday = [day];

  // incompatible with month day
  rrule.origOptions.bymonthday = undefined;
  rrule.options.bymonthday = [];
  return toString(rrule);
};

const toString = (rrule: RRule): string =>
  rrule.isFullyConvertibleToText() ? rrule.toText() : rrule.toString();
