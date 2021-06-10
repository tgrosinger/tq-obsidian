<script lang="ts">
  import type TQPlugin from '../main';
  import type { Task } from '../file-interface';
  import TaskListTask from './TaskListTask.svelte';
  import { groupBy, sortBy } from 'lodash';
  import type { Component } from 'obsidian';

  export let plugin: TQPlugin;
  export let view: Component;
  export let tasks: Task[];
  export let grouper: (t: Task) => any;
  export let keySorter: (k: string) => any;

  $: tasksGrouped = groupBy(tasks, grouper);
  $: groupKeys = Object.keys(tasksGrouped);
  $: sortedKeys = sortBy(groupKeys, keySorter);

  // TODO: How to filter out the "undefined" group and display differently?
</script>

<div>
  {#each sortedKeys as key (key)}
    {#if key !== 'undefined'}
      <h3>{key}</h3>
    {:else}
      <h3>No Due Date</h3>
    {/if}
    {#each tasksGrouped[key] as task (task.line)}
      <TaskListTask {task} {view} {plugin} />
    {/each}
  {/each}
</div>
