import { App, Modal, Plugin } from 'obsidian';
import { ISettings, settingsWithDefaults } from './settings';
import CreateTaskUI from './ui/CreateTaskUI.svelte';

export default class TQPlugin extends Plugin {
  public settings: ISettings;

  public async onload(): Promise<void> {
    console.log('tq: Loading plugin v' + this.manifest.version);

    await this.loadSettings();

    this.addCommand({
      id: 'create-task-modal',
      name: 'Create Task',
      callback: () => {
        new CreateTaskModal(this.app, this).open();
      },
    });
  }

  // TODO: Move this elsewhere
  public storeNewTask = async (
    description: string,
    due: string,
    repeat: string,
  ): Promise<void> => {
    const newHash = this.createTaskBlockHash();
    const fileName = `${this.settings.TasksDir}/${newHash}.md`;
    const data = this.formatNewTask(description, due, repeat);

    console.debug('tq: Creating a new task in ' + fileName);
    console.debug(data);

    if (!(await this.app.vault.adapter.exists(this.settings.TasksDir))) {
      await this.app.vault.createFolder(this.settings.TasksDir);
    }
    await this.app.vault.create(fileName, data);
  };

  // TODO: Move this elsewhere
  private formatNewTask = (
    description: string,
    due: string,
    repeat: string,
  ): string => {
    let frontMatter = [];
    if (due && due != '') {
      frontMatter.push('due: ' + due);
    }
    if (repeat && repeat != '') {
      frontMatter.push('repeat: ' + repeat);
    }

    let contents = [];
    if (frontMatter.length > 0) {
      contents.push('---');
      contents.push(...frontMatter);
      contents.push('---');
      contents.push('');
    }
    contents.push('- [ ] ' + description);

    return contents.join('\n');
  };

  // TODO: Move this elsewhere
  private createTaskBlockHash = (): string => {
    let result = 'task-';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

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
        store: this.plugin.storeNewTask,
      },
    });
  };

  public onClose = (): void => {
    const { contentEl } = this;
    contentEl.empty();
  };
}
