<script lang="ts">
  // TODO: Make a code block handler to embed this in daily note template
  // TODO: Make a custom version of calendar widget which shows number of tasks as the dots?

  import type { Component } from 'obsidian';
  import type { SharedState } from '../task-list-view';

  import type TQPlugin from '../main';
  import TaskListTask from './TaskListTask.svelte';
  import type { Writable } from 'svelte/store';

  import { every, filter } from 'lodash';
  import type { Task } from '../file-interface';

  export let plugin: TQPlugin;
  export let filters: ((task: Task) => boolean)[];
  export let view: Component;
  export let state: Writable<SharedState>;

  // TODO: Add sort by task score (probably to task controls)

  let taskCache = plugin.taskCache;
  let tasks = taskCache.tasks;
  $: filteredTasks = filter($tasks, (t) => every(filters, (f) => f(t)));
</script>

<div>
  {#each filteredTasks as task (task.line)}
    <TaskListTask {task} {view} {plugin} />
  {/each}
</div>
