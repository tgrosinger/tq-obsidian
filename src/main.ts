import { App, MarkdownPostProcessorContext, Modal, Plugin } from 'obsidian';
import { convertLegacyTask } from './legacy-parser';
import { FileInterface } from './file-interface';
import { ISettings, settingsWithDefaults } from './settings';
import CreateTaskUI from './ui/CreateTaskUI.svelte';
import { TaskView, TQTaskViewType } from './task-view';

// TODO: Switch to Preact
// https://github.com/liamcain/obsidian-preact-template

export default class TQPlugin extends Plugin {
  public settings: ISettings;
  public fileInterface: FileInterface;
  public view: TaskView;

  public async onload(): Promise<void> {
    console.log('tq: Loading plugin v' + this.manifest.version);

    await this.loadSettings();

    this.fileInterface = new FileInterface(this, this.app);

    this.registerView(
      TQTaskViewType,
      (leaf) => (this.view = new TaskView(leaf, this)),
    );

    // TODO: If triggered from a daily note, use that as the due date default
    this.addCommand({
      id: 'create-task-modal',
      name: 'Create Task',
      callback: () => {
        new CreateTaskModal(this.app, this).open();
      },
    });

    this.addCommand({
      id: 'convert-task',
      name: 'Convert Task',
      checkCallback: (checking: boolean): boolean | void => {
        const activeLeaf = this.app.workspace.activeLeaf;
        return convertLegacyTask(checking, activeLeaf, this.fileInterface);
      },
    });

    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.fileInterface.handleTaskModified(file);
        }
      }),
    );

    this.registerMarkdownPostProcessor(this.markdownPostProcessor);

    /*
    this.registerObsidianProtocolHandler('tq', (params) => {
      this.app.workspace.activeLeaf.setViewState({
        type: TQTaskViewType,
        state: { file: params.file },
      });
    });
    */
  }

  private async loadSettings(): Promise<void> {
    this.settings = settingsWithDefaults(await this.loadData());
  }

  private markdownPostProcessor = (
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
  ): void => {
    if (!ctx.sourcePath.startsWith(this.settings.TasksDir)) {
      return;
    }

    const info = ctx.getSectionInfo(el);
    if (!info) {
      return;
    }

    if (info.lineStart === 0) {
      this.renderTaskControls(el, ctx);
    }
  };

  private renderTaskControls = (
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
  ): void => {
    el.createEl('p').setText('Hello?');
  };
}

class CreateTaskModal extends Modal {
  private plugin: TQPlugin;

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
