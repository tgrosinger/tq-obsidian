<script lang="ts">
  import type { Task, TaskCache } from '../file-interface';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { App, Component, MarkdownRenderer } from 'obsidian';
  import { afterUpdate, onMount } from 'svelte';
  import { chevronDown, externalLink } from '../graphics';

  export let app: App;
  export let taskCache: TaskCache;
  export let task: Task;
  export let view: Component;

  let lineEl: HTMLElement;
  let expanded = false;

  const repeat = task.frontmatter.get('repeat');
  const due = task.frontmatter.get('due');
  const completed = task.frontmatter.get('completed');
  const lastCompleted = completed ? completed[completed.length - 1] : undefined;

  $: rootClasses = 'tq-task ' + (expanded ? 'expanded-root' : '');

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
    expanded = !expanded;
  };

  const toggleChecked = () => {
    taskCache.toggleChecked(task);
  };

  const viewSource = () => {
    let leaf = app.workspace.activeLeaf;
    if (leaf.getViewState().pinned) {
      leaf = app.workspace.createLeafBySplit(leaf);
    }
    leaf.openFile(task.file);
  };
</script>

<div class={rootClasses}>
  <input
    type="checkbox"
    bind:checked={task.checked}
    on:change={toggleChecked}
  />
  <span bind:this={lineEl} />
  <span on:click={viewSource}>
    {@html externalLink}
  </span>

  {#if !expanded}
    <span class="expand-chevron" on:click={toggleExpanded}>
      {@html chevronDown}
    </span>
  {:else}
    <span class="expand-chevron rotated-180" on:click={toggleExpanded}>
      {@html chevronDown}
    </span>
  {/if}

  {#if expanded}
    <div
      transition:slide={{
        duration: 300,
        easing: quintOut,
      }}
    >
      {#if repeat !== undefined}
        <div>
          <span>Repeat Schedule: </span><span>{repeat}</span>
        </div>
      {/if}
      {#if due !== undefined}
        <div>
          <span>Due: </span><span>{due}</span>
        </div>
      {/if}
      {#if lastCompleted !== undefined}
        <div>
          <span>Last Completed: </span><span>{lastCompleted}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .tq-task {
    background-color: var(--background-secondary);
    border-bottom: thin solid var(--background-modifier-border);
    padding: 5px;
  }

  .expanded-root {
    margin: 10px 0;
  }

  .expand-chevron {
    display: inline-block;
  }

  .rotated-180 {
    transform: rotate(180deg);
  }
</style>
