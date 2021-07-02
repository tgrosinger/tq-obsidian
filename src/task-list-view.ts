import type TQPlugin from './main';
import { CreateTaskModal } from './modals';
import { SharedState, stateWithDefaults } from './state';
import TasksUI from './ui/TasksUI.svelte';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Writable, writable } from 'svelte/store';

export const TQTaskListViewType = 'tq-task-list-view';

export class TaskListView extends ItemView {
  private readonly plugin: TQPlugin;
  private readonly state: Writable<SharedState>;

  constructor(leaf: WorkspaceLeaf, plugin: TQPlugin) {
    super(leaf);

    this.plugin = plugin;
    this.state = writable(
      stateWithDefaults(
        // TODO: Change default sort to 'score'
        { completed: false, sort: 'due', group: 'due' },
      ),
    );

    this.addAction('redo-glyph', 'Toggle show completed', () => {
      this.state.update((state) => {
        state.completed = !state.completed;
        return state;
      });
    });

    this.addAction('plus-with-circle', 'Add task', () => {
      new CreateTaskModal(this.app, this.plugin).open();
    });

    this.redraw();
  }
  public getViewType(): string {
    return TQTaskListViewType;
  }

  public getDisplayText(): string {
    return 'tq Tasks';
  }

  public getIcon(): string {
    return 'checkbox-glyph';
  }

  /*
  public getState(): any {
    return { file: this.filePath };
  }

  public async setState(state: any, result: ViewStateResult): Promise<void> {
    if ('file' in state) {
      this.filePath = state.file;
    }
    this.redraw();
  }
  */

  public readonly redraw = (): void => {
    const contentEl = this.containerEl.children[1];

    new TasksUI({
      target: contentEl,
      props: {
        plugin: this.plugin,
        view: this.leaf.view,
        state: this.state,
      },
    });
  };
}
