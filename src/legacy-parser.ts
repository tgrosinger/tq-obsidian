import type { FileInterface } from './file-interface';
import type { MarkdownView } from 'obsidian';

const taskRe = /\s*- \[[ xX>\-]\]/;
const repeatScheduleRe = /[;📅]\s*([-a-zA-Z0-9 =;:\,]+)/;

export const convertLegacyTask = (
  checking: boolean,
  activeLeaf: MarkdownView,
  fileInterface: FileInterface,
): boolean | void => {
  const currentLineNum = activeLeaf.editor.getCursor().line;
  const currentLine = activeLeaf.editor.getLine(currentLineNum);
  const parts = parseLegacyTaskLine(currentLine);

  if (!parts) {
    return false;
  } else if (checking) {
    return true;
  }

  const fileDate = window.moment(activeLeaf.file.basename, true);
  const due = fileDate.isValid() ? fileDate.format('YYYY-MM-DD') : undefined;

  fileInterface.storeNewTask(parts.description, due, parts.repeat, []);
};

const parseLegacyTaskLine = (
  line: string,
): { repeat: string; description: string } | undefined => {
  if (!taskRe.test(line)) {
    return undefined;
  }

  if (!repeatScheduleRe.test(line)) {
    return {
      repeat: undefined,
      description: line.replace(/\s*- \[[ xX>\-]\]/, '').trim(),
    };
  }

  const repeatMatches = repeatScheduleRe.exec(line);
  const repeatConfig =
    repeatMatches && repeatMatches.length === 2 ? repeatMatches[1] : undefined;

  const description = line
    .replace(repeatConfig, '')
    .slice(0, -3)
    .replace(/\s*- \[[ xX>\-]\]/, '')
    .trim();

  return {
    repeat: repeatConfig,
    description,
  };
};
