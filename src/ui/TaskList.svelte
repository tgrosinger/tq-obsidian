<script lang="ts">
  import type { Component } from 'obsidian';

  import type TQPlugin from '../main';
  import TaskListTask from './TaskListTask.svelte';

  export let plugin: TQPlugin;
  export let view: Component;

  let taskCache = plugin.taskCache;
  let tasks = taskCache.tasks;
</script>

<div>
  <p>This is the task list</p>

  {#each Object.entries($tasks) as [filepath, task] (filepath)}
    <TaskListTask {taskCache} {task} {view} />
  {/each}
</div>
