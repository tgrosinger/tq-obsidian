import { Frontmatter, setCompletedDate, setDueDateToNext } from './frontmatter';
import type TQPlugin from './main';
import type { Moment } from 'moment';
import { App, Notice, TAbstractFile, TFile, Vault } from 'obsidian';
import React from 'react';

export class Task {
  public file: TFile;
  public md: string;
  public frontmatter: Frontmatter;
  public line: string;
  public checked: boolean;
  public hideUntil: Moment | undefined;
  public due: Moment | undefined;
  public urgent: boolean;
  public important: boolean;

  private plugin: TQPlugin;

  constructor(file: TFile, contents: string, plugin: TQPlugin) {
    this.file = file;
    this.plugin = plugin;
    const metadata = plugin.app.metadataCache.getFileCache(file);

    if (
      !metadata.listItems ||
      metadata.listItems.length < 1 ||
      metadata.listItems[0].task === undefined
    ) {
      throw 'tq: No task found in task file ' + file.path;
    }

    const lines = contents.split('\n');
    const lineIdx = metadata.listItems[0].position.start.line;
    const frontmatter = new Frontmatter(lines);

    const hideUntil = frontmatter.get('hide-until');
    if (hideUntil && window.moment(hideUntil).isSameOrBefore(window.moment())) {
      // If we are past the hide date, then remove it
      this.removeHideUntil();
      throw 'task modified during loading';
    }

    const due = frontmatter.get('due');
    this.md = contents;
    this.frontmatter = frontmatter;
    this.line = lines[lineIdx].replace(/- \[[xX ]\]/, '');
    this.checked = ['x', 'X'].contains(metadata.listItems[0].task);
    this.hideUntil = hideUntil
      ? window.moment(hideUntil).endOf('day')
      : undefined;
    this.due = due ? window.moment(due).endOf('day') : undefined;
    this.important = frontmatter.get('important');
    this.urgent = frontmatter.get('urgent');
  }

  // setChecked will update the task file to the state represented in this
  // task object. The task object will not be modified, though the modifiction
  // of the file will trigger that task to be reloaded and the UI to be
  // rerendered.
  public readonly setChecked = async (checked: boolean): Promise<void> => {
    if (this.checked === checked) {
      return; // No action required
    }
    this.checked = checked;

    return withFileContents(
      this.file,
      this.plugin.app.vault,
      (lines): boolean => {
        const re = this.checked ? /^- \[[ ]\]/ : /^- \[[xX]\]/;
        const newValue = this.checked ? '- [x]' : '- [ ]';

        // Look for the task and check status
        const taskLine = lines.findIndex((line) => re.test(line));
        if (taskLine < 0) {
          console.warn(
            'tq: Unable to find a task line to toggle in file ' +
              this.file.path,
          );
          return false;
        }

        lines[taskLine] = lines[taskLine].replace(re, newValue);

        // We update this here rather than waiting for the file modified handler
        // so that the file is only updated once, rather than twice in rapid
        // succession.
        this.plugin.fileInterface.processRepeating(this.file.path, lines);

        return true;
      },
    );
  };

  public readonly calcTaskScore = (): number => {
    // Factors:
    // - Days overdue (current date - due date)
    // - Days until due (due date - current date)
    // - Priority
    // - Urgency
    // - How long ago it was created (more recent task are more important)

    let score = 1;
    if (this.checked) {
      return score;
    }

    if (this.due) {
      const untilDue = this.due.diff(window.moment(), 'days');
      if (untilDue > 0) {
        // Upcoming tasks use 1/(days until due)
        score *= 1 / untilDue;
      } else {
        // negative value indicates amount over-due
        // Overdue tasks use (days overdue)/2
        score *= untilDue / 2;
      }
    }

    if (this.urgent) {
      score *= 2;
    }
    if (this.important) {
      score *= 1.5;
    }

    return score;
  };

  private readonly removeHideUntil = async (): Promise<void> =>
    withFileContents(
      this.file,
      this.plugin.app.vault,
      (lines: string[]): boolean => {
        let frontmatter: Frontmatter;
        try {
          frontmatter = new Frontmatter(lines);
        } catch (error) {
          console.debug(error);
          return false;
        }

        frontmatter.remove('hide-until');
        frontmatter.overwrite();
        return true;
      },
    );
}

export type FilePath = string;

/**
 * TaskCache is the main interface for querying and modifying tasks. It
 * implements a Svelte store, so changes to the underlying tasks can be
 * automatically reflected in the UI.
 */
export class TaskCache {
  public tasks: Task[];
  public stateReceivers: React.Dispatch<React.SetStateAction<Task[]>>[];

  private readonly plugin: TQPlugin;
  private readonly app: App;

  public constructor(plugin: TQPlugin, app: App) {
    this.tasks = [];
    this.stateReceivers = [];
    this.plugin = plugin;
    this.app = app;
  }

  public readonly handleTaskModified = async (file: TFile): Promise<void> => {
    const contents = await this.app.vault.read(file);
    const metadata = this.app.metadataCache.getFileCache(file);
    try {
      const newTask = new Task(file, contents, this.plugin);
      this.tasks = this.tasks.filter((task) => task.file.path !== file.path);
      this.tasks.push(newTask);
      this.notify();
    } catch (e) {
      console.debug('tq: Unable to load task: ' + e);
    }
  };

  public readonly handleTaskDeleted = (path: string): void => {
    this.tasks = this.tasks.filter((task) => task.file.path !== path);
    this.notify();
  };

  private readonly notify = () => {
    this.stateReceivers.forEach((fn) => {
      fn(this.tasks);
    });
  };
}

export class FileInterface {
  private readonly plugin: TQPlugin;
  private readonly app: App;

  public constructor(plugin: TQPlugin, app: App) {
    this.plugin = plugin;
    this.app = app;
  }

  public readonly handleTaskModified = async (
    afile: TAbstractFile,
  ): Promise<void> => {
    const tfile = this.app.metadataCache.getFirstLinkpathDest(afile.path, '/');
    if (!tfile) {
      console.debug('tq: Unable to find TFile for TAFile: ' + afile.path);
      return;
    }

    return withFileContents(tfile, this.app.vault, (lines: string[]): boolean =>
      this.processRepeating(tfile.path, lines),
    );
  };

  public readonly updateTaskDue = async (
    file: TFile,
    vault: Vault,
    due: Moment,
  ): Promise<void> =>
    withFileContents(file, vault, (lines: string[]): boolean => {
      let frontmatter: Frontmatter;
      try {
        frontmatter = new Frontmatter(lines);
      } catch (error) {
        console.debug(error);
        return false;
      }

      frontmatter.set('due', due.startOf('day').toDate());
      frontmatter.overwrite();
      return true;
    });

  public readonly updateTaskRepeat = async (
    file: TFile,
    vault: Vault,
    repeatConfig: string,
  ): Promise<void> =>
    withFileContents(file, vault, (lines: string[]): boolean => {
      let frontmatter: Frontmatter;
      try {
        frontmatter = new Frontmatter(lines);
      } catch (error) {
        console.debug(error);
        return false;
      }

      frontmatter.set('repeat', repeatConfig);
      frontmatter.overwrite();
      return true;
    });

  // processRepeating checks the provided lines to see if they describe a
  // repeating task and whether that task is checked. If so, the task is
  // unchecked, the due date updated according to the repeat config, and the
  // current date added to the completed list in the frontmatter.
  public readonly processRepeating = (
    path: string,
    lines: string[],
  ): boolean => {
    let frontmatter: Frontmatter;
    try {
      frontmatter = new Frontmatter(lines);
    } catch (error) {
      console.debug(error);
      return false;
    }

    if (!frontmatter.contains('repeat')) {
      // This is not a repeating task, no work to do
      return false;
    }

    // Look for the task and check status
    const taskLine = lines.findIndex((line) => /^- \[[xX]\]/.test(line));
    if (taskLine < 0) {
      // Completed task not found, skip
      return false;
    }

    console.debug('tq: Reloading repeating task in ' + path);

    // Uncheck the task
    lines[taskLine] = lines[taskLine].replace(/\[[xX]\]/, '[ ]');

    setCompletedDate(frontmatter);
    setDueDateToNext(frontmatter);

    frontmatter.overwrite();

    new Notice('New task repetition created');
    return true;
  };

  public readonly storeNewTask = async (
    description: string,
    due: string,
    hideUntil: string,
    repeat: string,
    tags: string[],
    urgent: boolean,
    important: boolean,
  ): Promise<void> => {
    const tasksDir = this.plugin.settings.TasksDir;
    const newHash = this.createTaskBlockHash();
    const fileName = `${tasksDir}/${newHash}.md`;
    const data = this.formatNewTask(
      description,
      due,
      hideUntil,
      repeat,
      tags,
      urgent,
      important,
    );

    console.debug('tq: Creating a new task in ' + fileName);
    console.debug(data);

    if (!(await this.app.vault.adapter.exists(tasksDir))) {
      await this.app.vault.createFolder(tasksDir);
    }
    await this.app.vault.create(fileName, data);
  };

  private readonly formatNewTask = (
    description: string,
    due: string,
    hideUntil: string,
    repeat: string,
    tags: string[],
    urgent: boolean,
    important: boolean,
  ): string => {
    const frontMatter = [];
    if (due && due !== '') {
      frontMatter.push(`due: '${due}'`);
    }
    if (hideUntil && hideUntil !== '') {
      frontMatter.push(`hide-until: '${hideUntil}'`);
    }
    if (repeat && repeat !== '') {
      frontMatter.push('repeat: ' + repeat);
    }
    if (tags && tags.length > 0 && tags[0].length > 0) {
      frontMatter.push(`tags: [ ${tags.join(', ')} ]`);
    }
    if (urgent) {
      frontMatter.push('urgent: true');
    }
    if (important) {
      frontMatter.push('important: true');
    }

    const contents = [];
    if (frontMatter.length > 0) {
      contents.push('---');
      contents.push(...frontMatter);
      contents.push('---');
      contents.push('');
    }
    contents.push('- [ ] ' + description);

    return contents.join('\n');
  };

  private readonly createTaskBlockHash = (): string => {
    let result = 'task-';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
}

/**
 * Read the file contents and pass to the provided function as a list of lines.
 * If the provided function returns true, write the array back to the file.
 * NOTE: If useCache is true, the fn is not allowed to update the file!
 */
const withFileContents = async (
  file: TFile,
  vault: Vault,
  fn: (lines: string[]) => boolean,
): Promise<void> => {
  const fileContents = (await vault.read(file)) || '';
  const lines = fileContents.split('\n');

  const updated = fn(lines);
  if (updated) {
    return vault.modify(file, lines.join('\n'));
  }
};
