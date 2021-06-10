<script lang="ts">
  import type TQPlugin from '../main';
  import type { Task } from '../file-interface';
  import TaskListTask from './TaskListTask.svelte';
  import { sortBy } from 'lodash';
  import type { Component } from 'obsidian';

  export let plugin: TQPlugin;
  export let view: Component;
  export let tasks: Task[];
  export let sorter: (a: Task) => any;

  $: sortedTasks = sorter ? sortBy(tasks, sorter) : tasks;
</script>

<div>
  {#each sortedTasks as task (task.line)}
    <TaskListTask {task} {view} {plugin} />
  {/each}
</div>
