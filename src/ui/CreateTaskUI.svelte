<script lang="ts">
  import RepeatPicker from './RepeatPicker.svelte';
  import DuePicker from './DuePicker.svelte';
  import type { Moment } from 'moment';
  import type { App } from 'obsidian';
  import TextSuggest from './TextSuggest.svelte';

  export let close: () => void;
  export let store: (
    description: string,
    due: string,
    hideUntil: string,
    repeat: string,
    tags: string[],
    urgent: boolean,
    important: boolean,
  ) => void;
  export let app: App;

  const taskPlaceholders = [
    'Feed the chickens',
    'Unclog the toilet',
    'Paint the house',
    'Weed the garden',
    'Water the orchard',
  ];

  const tagCache = Object.keys((app.metadataCache as any).getTags());
  let description = '';
  let repeats = false;
  let repeatConfig = '';
  let due = '';
  let hideUntil = '';
  let showDuePicker = false;
  let tags = '';
  let urgent = false;
  let important = false;

  const save = () => {
    const cleanedTags = tags
      .split(/[, ]/)
      .filter((x) => x !== '')
      .map((tag) => tag.trim().replace('#', ''));
    store(
      description,
      due,
      hideUntil,
      repeats ? repeatConfig : '',
      cleanedTags,
      urgent,
      important,
    );
    close();
  };

  const setDue = (date: Moment): void => {
    due = date.format('YYYY-MM-DD');
  };

  const getPlaceholder = (): string => {
    const idx = Math.floor(Math.random() * taskPlaceholders.length);
    return taskPlaceholders[idx];
  };

  // TODO: Allow setting arbitrary fields in this form, configured in settings
</script>

<div>
  <label for="task-description"> Description </label>
  <input
    id="task-description"
    type="text"
    bind:value={description}
    placeholder={getPlaceholder()}
  />
</div>
<div>
  <label for="due-date"> Due </label>
  <input
    id="due-date"
    type="text"
    placeholder="No due date"
    bind:value={due}
    on:focus={() => (showDuePicker = true)}
  />
</div>
<div class={showDuePicker ? 'show' : 'hidden'}>
  <DuePicker
    startDate={due === '' ? window.moment() : window.moment(due)}
    close={() => (showDuePicker = false)}
    set={setDue}
  />
</div>
<RepeatPicker bind:repeats bind:repeatConfig close={null} set={null} />
<div>
  <label for="tags">Tags</label>
  <TextSuggest {app} bind:value={tags} suggestions={tagCache} />
</div>
<div>
  <label>
    <input type="checkbox" bind:checked={important} />
    Important
  </label>
</div>
<div>
  <label>
    <input type="checkbox" bind:checked={urgent} />
    Urgent
  </label>
</div>

<button on:click={save}>Save</button>

<style>
  .hidden {
    display: none;
  }

  label {
    width: 150px;
    display: inline-block;
  }
</style>
