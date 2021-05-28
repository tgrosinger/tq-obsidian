import type TQPlugin from './main';
import TasksUI from './ui/TasksUI.svelte';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Writable,writable } from 'svelte/store';

export const TQTaskListViewType = 'tq-task-list-view';

export interface SharedState {
  showCompleted: boolean;
}

export class TaskListView extends ItemView {
  private readonly plugin: TQPlugin;
  private readonly state: Writable<SharedState>;

  constructor(leaf: WorkspaceLeaf, plugin: TQPlugin) {
    super(leaf);

    this.plugin = plugin;
    this.state = writable({
      showCompleted: false,
    });

    this.addAction('redo-glyph', 'Toggle show completed', () => {
      this.state.update((state) => {
        state.showCompleted = !state.showCompleted;
        return state;
      });
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

    // See if I can use the markdown renderer to display the content?
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
