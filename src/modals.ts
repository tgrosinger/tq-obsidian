import type TQPlugin from './main';
import CreateTaskUI from './ui/CreateTaskUI.svelte';
import { App, Modal } from 'obsidian';

export class CreateTaskModal extends Modal {
  private readonly plugin: TQPlugin;

  constructor(app: App, plugin: TQPlugin) {
    super(app);
    this.plugin = plugin;
  }

  public onOpen = (): void => {
    const { titleEl, contentEl } = this;
    titleEl.setText('Create New Task');
    new CreateTaskUI({
      target: contentEl,
      props: {
        close: () => this.close(),
        store: this.plugin.fileInterface.storeNewTask,
      },
    });
  };

  public onClose = (): void => {
    const { contentEl } = this;
    contentEl.empty();
  };
}
