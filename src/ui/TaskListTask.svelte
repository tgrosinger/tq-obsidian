<script lang="ts">
  import type { Task, TaskCache } from '../file-interface';
  import { slide } from 'svelte/transition';
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

  const showDuePicker = () => {
    console.log('Showing due picker');
  };

  const showRepeatPicker = () => {
    console.log('Showing repeat picker');
  };
</script>

<div class={rootClasses}>
  <div class="task-row">
    <input
      type="checkbox"
      bind:checked={task.checked}
      on:change={toggleChecked}
    />
    <span class="task-line" bind:this={lineEl} />
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
  </div>

  {#if expanded}
    <div
      class="task-content"
      transition:slide={{
        duration: 300,
      }}
    >
      <div>
        <span class="label">Due:</span>
        <input
          type="text"
          class="value"
          value={due || 'No due date'}
          on:click={showDuePicker}
        />
      </div>
      <div>
        <span class="label">Repeat Schedule:</span>
        <input
          type="text"
          class="value"
          value={repeat || 'Does not repeat'}
          on:click={showRepeatPicker}
        />
      </div>
      {#if lastCompleted !== undefined}
        <div>
          <span class="label">Last Completed:</span>
          <input type="text" class="value" value={lastCompleted} disabled />
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

  .task-row {
    display: flex;
  }

  .task-line {
    flex: 1;
  }

  .expanded-root {
    margin: 10px 0;
  }

  .expand-chevron {
    display: inline-block;
    padding: 0 10px;
  }

  .rotated-180 {
    transform: rotate(180deg);
  }

  .task-content div {
    margin: 5px;
  }

  .label {
    width: 150px;
    display: inline-block;
  }

  .value {
    width: 300px;
  }
</style>
