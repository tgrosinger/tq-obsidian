<script lang="ts">
  import type { SharedState } from '../task-list-view';
  import type TQPlugin from '../main';
  import { CalcTaskScore, Task } from '../file-interface';
  import TaskListSorted from './TaskListSorted.svelte';
  import TaskListGrouped from './TaskListGrouped.svelte';
  import TaskListControls from './TaskListControls.svelte';
  import type { Component } from 'obsidian';
  import { every, filter } from 'lodash';
  import type { Writable } from 'svelte/store';

  export let plugin: TQPlugin;
  export let view: Component;
  export let state: Writable<SharedState>;
  export let filters: ((task: Task) => boolean)[] = [];
  export let hideControls = false;

  const filterCompleted = (t: Task) => !t.checked;
  let allFilters: ((task: Task) => boolean)[];
  $: {
    allFilters = filters.slice();
    if (!$state.showCompleted) {
      allFilters.push(filterCompleted);
    }
  }

  const sorterByScore = (t: Task): any => CalcTaskScore(t);
  const grouperByDate = (t: Task): any => t.due;
  const keySorterByDate = (k: string): any => window.moment(k);

  let taskCache = plugin.taskCache;
  let tasks = taskCache.tasks;
  $: filteredTasks = filter($tasks, (t) => every(allFilters, (f) => f(t)));
</script>

<div>
  {#if !hideControls}
    <TaskListControls {state} />
  {/if}

  {#if $state.orderby === 'due'}
    <TaskListGrouped
      {plugin}
      {view}
      grouper={grouperByDate}
      keySorter={keySorterByDate}
      tasks={filteredTasks}
    />
  {:else if $state.orderby === 'score'}
    <TaskListSorted
      {plugin}
      {view}
      tasks={filteredTasks}
      sorter={sorterByScore}
    />
  {/if}
</div>
