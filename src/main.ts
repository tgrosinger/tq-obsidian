import { FileInterface, TaskCache } from './file-interface';
import { convertLegacyTask } from './legacy-parser';
import { CreateTaskModal } from './modals';
import { ISettings, settingsWithDefaults } from './settings';
import { TaskListView, TQTaskListViewType } from './task-list-view';
import { TaskView, TQTaskViewType } from './task-view';
import TaskListForDate from './ui/TaskListForDate.svelte';
import { MarkdownPostProcessorContext, Plugin } from 'obsidian';

// TODO: Add action from calendar plugin to show tasks for a selected day

export default class TQPlugin extends Plugin {
  public settings: ISettings;
  public fileInterface: FileInterface;
  public taskCache: TaskCache;

  private view: TaskView;
  private tq: TaskListView;

  public async onload(): Promise<void> {
    console.log('tq: Loading plugin v' + this.manifest.version);

    await this.loadSettings();

    this.fileInterface = new FileInterface(this, this.app);
    this.taskCache = new TaskCache(this, this.app);

    this.registerView(
      TQTaskViewType,
      (leaf) => (this.view = new TaskView(leaf, this)),
    );
    this.registerView(
      TQTaskListViewType,
      (leaf) => (this.tq = new TaskListView(leaf, this)),
    );

    this.addRibbonIcon('checkbox-glyph', 'tq', () => {
      // TODO: Open in new pane if current pane is pinned
      this.app.workspace.activeLeaf.setViewState({
        type: TQTaskListViewType,
        state: {},
      });
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
        const activeLeaf = this.app.workspace.activeLeaf;
        return convertLegacyTask(checking, activeLeaf, this.fileInterface);
      },
    });

    // TODO: on('rename')

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
          this.taskCache.handleTaskDeleted(file);
        }
      }),
    );

    // this.registerMarkdownPostProcessor(this.markdownPostProcessor);

    this.registerMarkdownCodeBlockProcessor(
      'tq',
      this.markdownCodeBlockProcessor,
    );

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

  private readonly markdownCodeBlockProcessor = (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
  ): void => {
    // TODO: Allow adding config options on other lines, such as "show-completed"
    new TaskListForDate({
      target: el,
      props: {
        plugin: this,
        date: source.split('\n')[0].trim(),
        view: null,
        state: null,
      },
    });
  };

  private readonly markdownPostProcessor = (
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

  private readonly renderTaskControls = (
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
  ): void => {
    // TODO: Add "Open in tq" link to the top using protocol handler
    el.createEl('p').setText('Hello?');
  };
}
