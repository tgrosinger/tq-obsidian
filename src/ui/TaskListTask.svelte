<script lang="ts">
  import type { Task } from '../file-interface';
  import { chevronDown, externalLink, hide, overdueAlert } from '../graphics';
  import { DuePickerModal, RepeatPickerModal } from '../modals';
  import type TQPlugin from '../main';
  import type { Moment } from 'moment';
  import { slide } from 'svelte/transition';
  import type { Component } from 'obsidian';
  import { MarkdownRenderer } from 'obsidian';
  import { afterUpdate, onMount } from 'svelte';
  import TaskPriorityStripe from './TaskPriorityStripe.svelte';
  import { createPopper } from '@popperjs/core/lib/popper-lite';
  import DatePicker from './DatePicker.svelte';

  export let plugin: TQPlugin;
  export let task: Task;
  export let view: Component;

  let lineEl: HTMLElement;
  let expanded = false;

  let repeat = task.frontmatter.get('repeat');
  let due = task.due;
  const completed = task.frontmatter.get('completed');
  const lastCompleted = completed ? completed[completed.length - 1] : undefined;
  const overdue =
    (!task.checked && task.due?.isBefore(window.moment())) || false;

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
    plugin.taskCache.toggleChecked(task);
  };

  const viewSource = () => {
    let leaf = plugin.app.workspace.activeLeaf;
    if (leaf.getViewState().pinned) {
      leaf = plugin.app.workspace.createLeafBySplit(leaf);
    }
    leaf.openFile(task.file);
  };

  const showDuePicker = () => {
    new DuePickerModal(plugin.app, window.moment(due), (newDate: Moment) => {
      plugin.fileInterface.updateTaskDue(task.file, plugin.app.vault, newDate);
    }).open();
  };

  const showRepeatPicker = () => {
    new RepeatPickerModal(plugin.app, repeat, (repeatConfig: string) => {
      repeat = repeatConfig;
      plugin.fileInterface.updateTaskRepeat(
        task.file,
        plugin.app.vault,
        repeatConfig,
      );
    }).open();
  };

  const hideTask = (d: Moment) => {
    console.log(`Hiding until: ${d.format('YYYY-MM-DD')}`);
  };

  // TODO: Move somewhere else so this can be reused
  const showDatePicker = (
    anchor: HTMLElement,
    callback: (d: Moment) => void,
  ): (() => void) => {
    return () => {
      const el = createEl('div');
      const datePicker = new DatePicker({
        target: el,
        props: {},
      });

      console.log(anchor);
      console.log(el);
      const popper = createPopper(anchor, el, {});
    };
  };
</script>

<div class={rootClasses}>
  <div class="task-row">
    <TaskPriorityStripe {task} />

    <input
      type="checkbox"
      bind:checked={task.checked}
      on:change={toggleChecked}
    />
    <span class="task-line" bind:this={lineEl} />

    {#if overdue}
      <span
        class="overdue-alert action-button"
        title="Due {task.due.format('YYYY-MM-DD')}"
      >
        {@html overdueAlert}
      </span>
    {/if}

    <span
      title="Hide task"
      on:click={showDatePicker(undefined, hideTask)}
      class="action-button"
    >
      {@html hide}
    </span>

    <span on:click={viewSource} title="View note" class="action-button">
      {@html externalLink}
    </span>

    {#if !expanded}
      <span
        class="expand-chevron action-button"
        on:click={toggleExpanded}
        title="See details"
      >
        {@html chevronDown}
      </span>
    {:else}
      <span
        class="expand-chevron rotated-180 action-button"
        on:click={toggleExpanded}
        title="Hide details"
      >
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
          value={due ? due.format('YYYY-MM-DD') : 'No due date'}
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

  .action-button {
    margin: 0 5px;
  }

  .expand-chevron {
    display: inline-block;
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
