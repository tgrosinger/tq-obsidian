import { App, Notice, TAbstractFile, TFile, Vault } from 'obsidian';
import { Frontmatter, setCompleted, setDueDate } from './frontmatter';
import type TQPlugin from './main';

export class FileInterface {
  private plugin: TQPlugin;
  private app: App;

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

    return withFileContents(tfile, this.app.vault, (lines): boolean => {
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

      console.debug('tq: Reloading repeating task in ' + tfile.path);

      // Uncheck the task
      lines[taskLine] = lines[taskLine].replace(/\[[xX]\]/, '[ ]');

      setCompleted(frontmatter);
      setDueDate(frontmatter);

      frontmatter.overwrite();

      new Notice('New task repetition created');
      return true;
    });
  };

  public readonly storeNewTask = async (
    description: string,
    due: string,
    repeat: string,
  ): Promise<void> => {
    const tasksDir = this.plugin.settings.TasksDir;
    const newHash = this.createTaskBlockHash();
    const fileName = `${tasksDir}/${newHash}.md`;
    const data = this.formatNewTask(description, due, repeat);

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
