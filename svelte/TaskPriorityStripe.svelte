<script lang="ts">
  import type { Task } from '../file-interface';

  export let task: Task;
</script>

{#if task.urgent && task.important}
  <div class="priority-stripe both" />
{:else if task.urgent}
  <div class="priority-stripe urgent" />
{:else if task.important}
  <div class="priority-stripe important" />
{:else}
  <div class="priority-stripe neither" />
{/if}

<style>
  .priority-stripe {
    width: 1px;
    position: relative;
    margin: -5px 4px -5px -4px;
  }

  .both {
    background-color: purple;
  }

  .urgent {
    background-color: red;
  }

  .important {
    background-color: yellow;
  }
</style>
