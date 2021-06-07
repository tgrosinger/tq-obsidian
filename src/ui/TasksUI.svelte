<script lang="ts">
  import type { Component } from 'obsidian';
  import type { SharedState } from '../task-list-view';

  import type TQPlugin from '../main';
  import TaskListByScore from './TaskListByScore.svelte';
  import TaskListByDue from './TaskListByDue.svelte';
  import type { Writable } from 'svelte/store';
  import TaskListControls from './TaskListControls.svelte';

  export let plugin: TQPlugin;
  export let view: Component;
  export let state: Writable<SharedState>;
</script>

<div>
  <TaskListControls {state} />

  {#if $state.orderby === 'due'}
    <TaskListByDue {plugin} {view} {state} />
  {:else if $state.orderby === 'score'}
    <TaskListByScore {plugin} {view} {state} />
  {/if}
</div>
