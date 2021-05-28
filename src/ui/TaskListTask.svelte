<script lang="ts">
  import type { Task, TaskCache } from '../file-interface';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { Component, MarkdownRenderer } from 'obsidian';
  import { afterUpdate, onMount } from 'svelte';

  export let taskCache: TaskCache;
  export let task: Task;
  export let view: Component;

  let lineEl: HTMLElement;
  let expanded = false;

  // TODO: Links in rendered markdown do not work yet

  onMount(() => {
    const tempEl = createDiv();
    MarkdownRenderer.renderMarkdown(task.line, tempEl, task.file.path, view);
    lineEl.innerHTML = tempEl.children[0].innerHTML;
  });
  afterUpdate(() => {
    const tempEl = createDiv();
    MarkdownRenderer.renderMarkdown(task.line, tempEl, task.file.path, view);
    lineEl.innerHTML = tempEl.children[0].innerHTML;
  });

  const toggleExpanded = (event: MouseEvent) => {
    // The checkbox should not toggle expanding the task details
    if ((event.target as Element).tagName !== 'INPUT') {
      expanded = !expanded;
    }
  };

  const toggleChecked = () => {
    taskCache.toggleChecked(task);
  };
</script>

<div on:click={toggleExpanded}>
  <input
    type="checkbox"
    bind:checked={task.checked}
    on:change={toggleChecked}
  />
  <span bind:this={lineEl} />
  {#if expanded}
    <div
      transition:slide={{
        duration: 300,
        easing: quintOut,
      }}
    >
      More details!
    </div>
  {/if}
</div>
