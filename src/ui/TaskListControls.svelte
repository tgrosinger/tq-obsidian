<script lang="ts">
  import type { SharedState } from '../task-list-view';
  import type { Writable } from 'svelte/store';
  import { calendar, ol } from '../graphics';

  export let state: Writable<SharedState>;

  const setOrderBy = (order: 'due' | 'score') => {
    state.update((state) => {
      state.orderby = order;
      return state;
    });
  };
</script>

<div id="tq-task-controls">
  {#if $state.orderby === 'score'}
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
