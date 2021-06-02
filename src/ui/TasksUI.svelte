<script lang="ts">
  import type { Component, App } from 'obsidian';
  import type { SharedState } from '../task-list-view';

  import type TQPlugin from '../main';
  import TaskListBasic from './TaskListBasic.svelte';
  import TaskListByDue from './TaskListByDue.svelte';
  import type { Writable } from 'svelte/store';
  import TaskListControls from './TaskListControls.svelte';

  export let app: App;
  export let plugin: TQPlugin;
  export let view: Component;
  export let state: Writable<SharedState>;
</script>

<div>
  <TaskListControls {state} />

  {#if $state.groupby === 'due'}
    <TaskListByDue {app} {plugin} {view} {state} />
  {:else if $state.groupby === 'none'}
    <TaskListBasic {app} {plugin} {view} {state} />
  {/if}
</div>
