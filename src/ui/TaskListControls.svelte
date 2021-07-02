<script lang="ts">
  import type { SharedState } from '../state';
  import { calendar, ol } from '../graphics';
  import type { Writable } from 'svelte/store';

  export let state: Writable<SharedState>;

  const setOrderBy = (order: 'due' | 'score') => {
    state.update((state) => {
      if (order === 'due') {
        state.sort = 'score';
        state.group = 'due';
      } else {
        state.sort = 'score';
        state.group = undefined;
      }
      return state;
    });
  };
</script>

<div id="tq-task-controls">
  {#if $state.sort === 'score'}
    <button name="Order by due" on:click={() => setOrderBy('due')}>
      {@html ol}
    </button>
  {:else}
    <button name="Order by task score" on:click={() => setOrderBy('score')}>
      {@html calendar}
    </button>
  {/if}
</div>

<style>
  #tq-task-controls {
    padding-bottom: 10px;
    background-color: var(--background-secondary);
  }
</style>
