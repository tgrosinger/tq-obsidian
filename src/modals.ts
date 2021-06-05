import type TQPlugin from './main';
import CreateTaskUI from './ui/CreateTaskUI.svelte';
import DuePicker from './ui/DuePicker.svelte';
import { App, Modal } from 'obsidian';
import type { Moment } from 'moment';

export class DuePickerModal extends Modal {
  readonly startDate: Moment;
  readonly set: (date: Moment) => void;

  constructor(app: App, startDate: Moment, set: (date: Moment) => void) {
    super(app);

    this.startDate = startDate;
    this.set = set;
  }

  public onOpen = (): void => {
    const { titleEl, contentEl } = this;
    titleEl.setText('Create New Task');
    new DuePicker({
      target: contentEl,
      props: {
        close: () => this.close(),
        set: this.set,
        startDate: this.startDate,
      },
    });
  };

  public onClose = (): void => {
    const { contentEl } = this;
    contentEl.empty();
  };
}
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
