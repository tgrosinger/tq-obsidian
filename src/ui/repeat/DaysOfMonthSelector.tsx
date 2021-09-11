import React from 'react';
import RRule, { Frequency } from 'rrule';
import { Repeater } from '../../rrule-adapter';

export const DaysOfMonthSelector: React.FC<{
  repeater: Repeater;
  setRepeater: React.Dispatch<React.SetStateAction<Repeater>>;
}> = (props): JSX.Element => {
  if (
    !props.repeater ||
    !props.repeater.rrule ||
    ![Frequency.MONTHLY, Frequency.YEARLY].includes(
      props.repeater.rrule.origOptions.freq,
    )
  ) {
    return null;
  }

  // TODO: Must not modify props!

  const [repeatType, setRepeatType] = React.useState('every');
  React.useEffect(() => {
    const t = props.repeater.rrule.origOptions.byweekday ? 'every' : 'onThe';
    if (t !== repeatType) {
      setRepeatType(t);
    }
  }, [props.repeater.rrule.origOptions.byweekday]);

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
        <OnTheSelector
          repeater={props.repeater}
          setRepeater={props.setRepeater}
        />
      ) : (
        <EverySelector
          repeater={props.repeater}
          setRepeater={props.setRepeater}
        />
      )}
    </div>
  );
};

const OnTheSelector: React.FC<{
  repeater: Repeater;
  setRepeater: React.Dispatch<React.SetStateAction<Repeater>>;
}> = (props): JSX.Element => {
  let day = props.repeater.rrule.origOptions.bymonthday || '';
  if (Array.isArray(day)) {
    day = day.length > 0 ? day[0] : 1;
  }

  const setLastDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setRepeater(withOnTheLast(e.target.checked, props.repeater));
  };

  const setDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setRepeater(withOnThe(parseInt(e.target.value), props.repeater));
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
  repeater: Repeater;
  setRepeater: React.Dispatch<React.SetStateAction<Repeater>>;
}> = (props): JSX.Element => (
  <button
    onClick={() => {
      // Default value of every Monday
      props.setRepeater(withEvery(0, props.repeater));
    }}
  >
    Set Every
  </button>
);

const withOnTheLast = (lastDay: boolean, repeater: Repeater): Repeater =>
  repeater.modify((rrule: RRule) => {
    if (lastDay) {
      rrule.origOptions.bymonthday = -1;
      rrule.options.bymonthday = [-1];
    } else {
      rrule.origOptions.bymonthday = undefined;
      rrule.options.bymonthday = undefined;
    }

    rrule.origOptions.byweekday = []; // incompatible with weekdays of month
  });

const withOnThe = (day: number, repeater: Repeater): Repeater =>
  repeater.modify((rrule: RRule) => {
    console.debug('Setting repeat to day: ' + day);

    rrule.origOptions.bymonthday = day;
    rrule.options.bymonthday = [day];

    rrule.origOptions.byweekday = []; // incompatible with weekdays of month
  });

const withEvery = (day: number, repeater: Repeater): Repeater =>
  repeater.modify((rrule: RRule) => {
    rrule.origOptions.byweekday = [day];

    // incompatible with month day
    rrule.origOptions.bymonthday = undefined;
    rrule.options.bymonthday = [];
  });
