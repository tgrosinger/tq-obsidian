<script lang="ts">
  import type { Component } from 'obsidian';
  import type { SharedState } from '../task-list-view';

  import type TQPlugin from '../main';
  import TaskList from './TaskList.svelte';
  import type { Writable } from 'svelte/store';

  export let plugin: TQPlugin;
  export let view: Component;
  export let state: Writable<SharedState>;
</script>

<div>
  <TaskList {plugin} {view} {state} />
</div>
