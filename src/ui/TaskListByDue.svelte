<script lang="ts">
  import type { Component, App } from 'obsidian';
  import type { SharedState } from '../task-list-view';

  import type TQPlugin from '../main';
  import TaskListTask from './TaskListTask.svelte';
  import type { Writable } from 'svelte/store';

  import { filter, groupBy } from 'lodash';

  export let plugin: TQPlugin;
  export let view: Component;
  export let state: Writable<SharedState>;

  let taskCache = plugin.taskCache;
  let tasks = taskCache.tasks;
  $: filteredTasks = filter(
    $tasks,
    (task) => !task.checked || $state.showCompleted,
  );
  $: tasksByDue = groupBy(filteredTasks, (task) => task.due);
  $: dueDates = Object.keys(tasksByDue);
  $: {
    dueDates.sort((a, b) => {
      if (a === undefined) {
        return -1;
      } else if (b === undefined) {
        return 1;
      }
      const dateA = window.moment(a);
      const dateB = window.moment(b);
      return dateA.isBefore(dateB) ? -1 : 1;
    });
  }
</script>

<div>
  {#each dueDates as dueDate (dueDate)}
    <h3>{dueDate}</h3>
    {#each tasksByDue[dueDate] as task (task.line)}
      <TaskListTask {task} {view} {plugin} />
    {/each}
  {/each}
</div>
