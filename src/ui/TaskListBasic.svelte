<script lang="ts">
  import type { Component } from 'obsidian';
  import type { SharedState } from '../task-list-view';

  import type TQPlugin from '../main';
  import TaskListTask from './TaskListTask.svelte';
  import type { Writable } from 'svelte/store';

  export let plugin: TQPlugin;
  export let view: Component;
  export let state: Writable<SharedState>;

  let taskCache = plugin.taskCache;
  let tasks = taskCache.tasks;
</script>

<div>
  {#each Object.entries($tasks) as [filepath, task] (filepath)}
    {#if !task.checked || $state.showCompleted}
      <TaskListTask {taskCache} {task} {view} />
    {/if}
  {/each}
</div>
