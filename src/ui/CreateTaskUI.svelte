<script lang="ts">
  import RepeatBuilder from './RepeatBuilder.svelte';

  export let close: () => void;
  export let store: (description: string, due: string, repeat: string) => void;

  let description = '';
  let repeats = false;
  let repeatConfig = '';
  //let due = window.moment().format('YYYY-MM-DD');
  let due: string;

  const save = () => {
    store(description, due, repeats ? repeatConfig : '');
    close();
  };
</script>

<div>
  <label>
    Description
    <!-- TODO: Rotating placeholders? -->
    <input type="text" bind:value={description} placeholder="Walk the dog" />
  </label>
</div>

<div>
  <label>
    Due
    <input type="date" bind:value={due} />
  </label>
</div>

<div>
  <label>
    Repeats
    <input type="checkbox" bind:checked={repeats} />
  </label>
</div>

{#if repeats}
  <RepeatBuilder bind:repeatConfig />
{/if}

<button on:click={save}>Save</button>
