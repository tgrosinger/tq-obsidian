import { ItemView, ViewStateResult, WorkspaceLeaf } from 'obsidian';
import type TQPlugin from './main';

export const TQTaskViewType = 'tq-task-view';

export class TaskView extends ItemView {
  private readonly plugin: TQPlugin;
  private filePath: string;

  constructor(leaf: WorkspaceLeaf, plugin: TQPlugin) {
    super(leaf);

    this.plugin = plugin;
    this.redraw();
  }
  public getViewType(): string {
    return TQTaskViewType;
  }

  public getDisplayText(): string {
    return 'tq Task'; // TODO: Make this more useful
  }

  public getIcon(): string {
    return 'checkbox-glyph';
  }

  public getState(): any {
    return { file: this.filePath };
  }

  public async setState(state: any, result: ViewStateResult): Promise<void> {
    if ('file' in state) {
      this.filePath = state.file;
    }
    this.redraw();
  }

  public readonly redraw = (): void => {
    const contentEl = this.containerEl.children[1];

    if (!this.filePath || this.filePath === '') {
      contentEl.empty();
      const p = contentEl.createDiv({ cls: 'tq-warning' }).createEl('p');
      p.setText('No file selected');
      return;
    }

    contentEl.empty();
    const p = contentEl.createEl('p');
    p.setText('Hello World: ' + this.filePath);
    // See if I can use the markdown renderer to display the content?
  };
}
