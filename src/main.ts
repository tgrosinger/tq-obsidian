import { App, Modal, Plugin } from 'obsidian';
import { convertLegacyTask } from './legacy-parser';
import { FileInterface } from './file-interface';
import { ISettings, settingsWithDefaults } from './settings';
import CreateTaskUI from './ui/CreateTaskUI.svelte';

export default class TQPlugin extends Plugin {
  public settings: ISettings;
  public fileInterface: FileInterface;

  public async onload(): Promise<void> {
    console.log('tq: Loading plugin v' + this.manifest.version);

    await this.loadSettings();

    this.fileInterface = new FileInterface(this, this.app);

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
  }

  private async loadSettings(): Promise<void> {
    this.settings = settingsWithDefaults(await this.loadData());
  }
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
