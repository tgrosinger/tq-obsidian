<script lang="ts">
  import type { Component } from 'obsidian';

  import type TQPlugin from '../main';
  import TaskList from './TaskList.svelte';

  export let plugin: TQPlugin;
  export let view: Component;
</script>

<div>
  <p>Hello World</p>

  <TaskList {plugin} {view} />
</div>
