<script lang="ts">
  import ButtonGroup from './ButtonGroup.svelte';
  import WeekDaysOfMonthSelector from './WeekDaysOfMonthSelector.svelte';
  import { RepeatAdapter } from 'src/repeat';
  import RRule, { Frequency } from 'rrule';

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

  // TODO: Support localizations
  const weekdays = [
    { id: 6, text: 'S' },
    { id: 0, text: 'M' },
    { id: 1, text: 'T' },
    { id: 2, text: 'W' },
    { id: 3, text: 'T' },
    { id: 4, text: 'F' },
    { id: 5, text: 'S' },
  ];

  // TODO: Support localizations
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

  export let repeatConfig: string;
  export let repeats: boolean;
  export let set: (repeatConfig: string) => void;
  export let close: () => void;

  const repeater =
    repeatConfig != ''
      ? new RepeatAdapter(RRule.fromText(repeatConfig))
      : new RepeatAdapter(new RRule({ freq: Frequency.WEEKLY, interval: 1 }));

  repeater.subscribe((value: RepeatAdapter) => {
    repeatConfig = value.toText();
  });

  const startingRepeatType =
    repeater.getWeekDaysOfMonth().length > 0 ? 'every' : 'onThe';
  let monthlyRepeatType = startingRepeatType;

  const save = (): void => {
    set(repeats ? repeatConfig : 'none');
    close();
  };
</script>

<div class="form">
  <div>
    <label>
      Repeats
      <input type="checkbox" bind:checked={repeats} />
    </label>
  </div>

  {#if repeats}
    <div class="interval-row">
      <span>Every</span>
      <input
        id="interval-selector"
        bind:value={$repeater.interval}
        type="number"
        min="1"
      />

      <!-- svelte-ignore a11y-no-onchange -->
      <select
        id="frequency-selector"
        class="dropdown"
        bind:value={$repeater.frequency}
      >
        <option value={Frequency.DAILY}>
          {$repeater.interval > 1 ? 'Days' : 'Day'}
        </option>
        <option value={Frequency.WEEKLY}>
          {$repeater.interval > 1 ? 'Weeks' : 'Week'}
        </option>
        <option value={Frequency.MONTHLY}>
          {$repeater.interval > 1 ? 'Months' : 'Month'}
        </option>
        <option value={Frequency.YEARLY}>
          {$repeater.interval > 1 ? 'Years' : 'Year'}
        </option>
      </select>
    </div>
    <div class="interval-row">
      {#if $repeater.frequency === Frequency.WEEKLY}
        <div class="days-btn-group">
          <ButtonGroup
            buttons={weekdays}
            activeButtonIDs={repeater.daysOfWeek}
            onUpdate={repeater.setDaysOfWeek}
          />
        </div>
      {/if}

      {#if $repeater.frequency === Frequency.YEARLY}
        <div class="months-btn-group">
          <ButtonGroup
            buttons={months}
            activeButtonIDs={repeater.monthsOfYear}
            onUpdate={repeater.setMonthsOfYear}
          />
        </div>
      {/if}

      {#if $repeater.frequency === Frequency.MONTHLY || $repeater.frequency === Frequency.YEARLY}
        <div>
          <select class="dropdown" bind:value={monthlyRepeatType}>
            <option value={'onThe'}>on the</option>
            <option value={'every'}>every</option>
          </select>

          {#if monthlyRepeatType == 'onThe'}
            <input
              id="onthe-selector"
              bind:value={$repeater.dayOfMonth}
              disabled={$repeater.dayOfMonth === -1}
              placeholder="1"
              type="number"
            />
            <label>
              <input bind:checked={$repeater.lastDayOfMonth} type="checkbox" />
              Last Day
            </label>
          {:else}
            <span>
              <WeekDaysOfMonthSelector
                initialSelected={repeater.getWeekDaysOfMonth()}
                onUpdate={repeater.setWeekDaysOfMonth}
              />
            </span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if set !== null}
    <button on:click={save}>Save</button>
  {/if}
</div>

<style>
  .form input {
    border-radius: 0.5em;
    padding: 19px 14px;
  }

  #interval-selector {
    width: 60px;
    height: 40px;
  }

  .interval-row {
    margin: 5px 0px;
  }

  #frequency-selector {
    width: 103px;
    height: 40px;
  }

  #onthe-selector {
    width: 60px;
    height: 40px;
  }
</style>
