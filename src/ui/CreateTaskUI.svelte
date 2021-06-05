<script lang="ts">
  import RepeatPicker from './RepeatPicker.svelte';
  import DuePicker from './DuePicker.svelte';
  import type { Moment } from 'moment';

  export let close: () => void;
  export let store: (description: string, due: string, repeat: string) => void;

  let description = '';
  let repeats = false;
  let repeatConfig = '';
  let due = window.moment();

  const save = () => {
    store(description, due.format('YYYY-MM-DD'), repeats ? repeatConfig : '');
    close();
  };

  const setDue = (date: Moment): void => {
    due = date;
  };

  // TODO: Allow setting arbitrary fields in this form, configured in settings
</script>

<div>
  <label>
    Description
    <!-- TODO: Rotating placeholders? -->
    <input type="text" bind:value={description} placeholder="Walk the dog" />
  </label>
</div>

<DuePicker startDate={due} close={null} set={setDue} />
<RepeatPicker bind:repeats bind:repeatConfig close={null} set={null} />

<button on:click={save}>Save</button>
