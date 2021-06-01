<script lang="ts">
  import type { SharedState } from '../task-list-view';
  import type { Writable } from 'svelte/store';

  export let state: Writable<SharedState>;

  const toggleGroupBy = () => {
    state.update((state) => {
      state.groupby = state.groupby === 'none' ? 'due' : 'none';
      return state;
    });
  };
</script>

<div id="tq-task-controls">
  <p>Task Controls</p>

  <label>
    <input
      type="checkbox"
      checked={$state.groupby === 'due'}
      on:change={toggleGroupBy}
    />
    Group by due date
  </label>
</div>

<style>
  #tq-task-controls {
    padding-bottom: 10px;
  }
</style>
