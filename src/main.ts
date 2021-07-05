import { FileInterface, TaskCache } from './file-interface';
import { convertLegacyTask } from './legacy-parser';
import { CreateTaskModal } from './modals';
import { ISettings, settingsWithDefaults } from './settings';
import { stateFromConfig } from './state';
import TasksUI from './ui/TasksUI.svelte';
import {
  MarkdownPostProcessorContext,
  MarkdownView,
  Notice,
  Plugin,
} from 'obsidian';
import { writable } from 'svelte/store';

export default class TQPlugin extends Plugin {
  public settings: ISettings;
  public fileInterface: FileInterface;
  public taskCache: TaskCache;

  public async onload(): Promise<void> {
    console.log('tq: Loading plugin v' + this.manifest.version);

    await this.loadSettings();

    this.fileInterface = new FileInterface(this, this.app);
    this.taskCache = new TaskCache(this, this.app);

    this.addRibbonIcon('checkbox-glyph', 'tq', () => {
      new CreateTaskModal(this.app, this).open();
    });

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
        const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeLeaf) {
          return false;
        }
        return convertLegacyTask(checking, activeLeaf, this.fileInterface);
      },
    });

    this.registerEvent(
      this.app.vault.on('rename', (afile, oldPath) => {
        if (oldPath.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskDeleted(oldPath);
          const file = this.app.metadataCache.getFirstLinkpathDest(
            afile.path,
            '/',
          );
          if (file) {
            this.taskCache.handleTaskModified(file);
          }
        }
      }),
    );

    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.fileInterface.handleTaskModified(file);
        }
      }),
    );

    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskModified(file);
        }
      }),
    );
    this.registerEvent(
      this.app.metadataCache.on('resolve', (file) => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskModified(file);
        }
      }),
    );

    this.registerEvent(
      this.app.vault.on('delete', (file) => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskDeleted(file.path);
        }
      }),
    );

    this.registerMarkdownCodeBlockProcessor(
      'tq',
      this.markdownCodeBlockProcessor,
    );

    this.registerObsidianProtocolHandler('tq', async (params) => {
      if (!params.create) {
        console.debug('tq: Unknown URL request');
        console.debug(params);
        return;
      }

      if (!params.task) {
        new Notice('Cannot create a task with no "task" property');
        return;
      }

      await this.fileInterface.storeNewTask(
        params.task,
        params.due,
        params.repeat,
        params.tags ? params.tags.split(',') : [],
        false,
        false,
      );

      new Notice('Task created');
    });
  }

  private async loadSettings(): Promise<void> {
    this.settings = settingsWithDefaults(await this.loadData());
  }

  private readonly markdownCodeBlockProcessor = (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
  ): void => {
    new TasksUI({
      target: el,
      props: {
        plugin: this,
        view: null,
        state: writable(stateFromConfig(source.split('\n'))),
      },
    });
  };
}
