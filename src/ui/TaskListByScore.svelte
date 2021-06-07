<script lang="ts">
  import type { Component } from 'obsidian';
  import type { SharedState } from '../task-list-view';

  import type TQPlugin from '../main';
  import TaskListTask from './TaskListTask.svelte';
  import type { Writable } from 'svelte/store';
  import { CalcTaskScore } from '../file-interface';

  export let plugin: TQPlugin;
  export let view: Component;
  export let state: Writable<SharedState>;

  let taskCache = plugin.taskCache;
  let tasks = taskCache.tasks;
  $: tasksList = Object.values($tasks);
  $: {
    tasksList.sort((a, b) => CalcTaskScore(a) - CalcTaskScore(b));
  }
</script>

<div>
  {#each tasksList as task (task.line)}
    {#if !task.checked || $state.showCompleted}
      <TaskListTask {task} {view} {plugin} />
    {/if}
  {/each}
</div>
