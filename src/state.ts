import type { Task } from './file-interface';
import { intersection } from 'lodash';

const SharedStateDefaults: SharedState = {
  overdue: true,
  due: true,
  noDue: true,
  completed: true,
  sort: 'score',
  group: undefined,
  selectTags: [],
  selectDay: undefined,
  selectWeek: undefined,
};

export interface SharedState {
  overdue: boolean;
  due: boolean;
  noDue: boolean;
  completed: boolean;
  sort: 'due' | 'score' | undefined;
  group: 'due' | 'completed' | undefined;

  selectTags: string[];
  selectDay: string | undefined;
  selectWeek: string | undefined;
}

export const stateWithDefaults = (
  props: Partial<SharedState>,
): SharedState => ({
  ...SharedStateDefaults,
  ...props,
});

export const stateFromConfig = (lines: string[]): SharedState => {
  const state = stateWithDefaults({});
  lines.forEach((line) => {
    if (line === '') {
      return;
    }
    const parts = line.split(':').map((part) => part.trim());
    if (parts.length !== 2) {
      console.error(`tq: Invalid line in config "${line}"`);
      return;
    }
    switch (parts[0]) {
      case 'overdue':
        state.overdue = parts[1] === 'true';
        break;
      case 'due':
        state.due = parts[1] === 'true';
        break;
      case 'no-due':
        state.noDue = parts[1] === 'true';
        break;
      case 'completed':
        state.completed = parts[1] === 'true';
        break;
      case 'sort':
        switch (parts[1]) {
          case 'due':
            state.sort = 'due';
            break;
          case 'score':
            state.sort = 'score';
            break;
          default:
            console.error(`tq: Invalid line in config "${line}"`);
            state.sort = undefined;
            break;
        }
        break;
      case 'group':
        switch (parts[1]) {
          case 'due':
            state.group = 'due';
            break;
          case 'completed':
            state.group = 'completed';
            break;
          default:
            console.error(`tq: Invalid line in config "${line}"`);
            state.group = undefined;
            break;
        }
        break;
      case 'select-tags':
        if (parts[1].match(/^\[.*\]$/)) {
          state.selectTags = parts[1]
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .split(',')
            .map((t) => t.trim());
        } else {
          state.selectTags = [parts[1]];
        }
        break;
      case 'select-day':
        state.selectDay = parts[1];
        state.due = true;
        break;
      case 'select-week':
        state.selectWeek = parts[1];
        state.due = true;
        break;
      default:
        break;
    }
  });

  return state;
};

export type Filter = (task: Task) => boolean;
export const filtersFromState = (state: SharedState): Filter[] => {
  const filters = [];

  // Cheap and bulky comparisons first

  if (state.due && state.noDue) {
    // Keep all
  } else if (state.due) {
    // Filter tasks with no due property
    filters.push((task: Task) => task.due !== undefined);
  } else if (state.noDue) {
    // Filter tasks with a due property
    filters.push((task: Task) => task.due === undefined);
  } else {
    // Filter all (probably an error)
  }

  if (state.selectDay && state.selectDay.length > 0) {
    filters.push((task: Task) => task.due === state.selectDay);
  }

  if (!state.completed) {
    filters.push((task: Task) => !task.checked);
  }

  // More expensive, targeted comparisons last

  if (state.selectTags && state.selectTags.length > 0) {
    filters.push((task: Task) => {
      let tags = task.frontmatter.get('tags');
      if (!tags) {
        return false;
      }
      if (!Array.isArray(tags)) {
        tags = [tags];
      }

      return intersection(tags, state.selectTags).length > 0;
    });
  }

  if (state.selectWeek && state.selectWeek.length > 0) {
    const selectedWeek = window.moment(state.selectWeek).startOf('week');

    filters.push((task: Task) => {
      const due = window.moment(task.due);
      return due >= selectedWeek && due <= selectedWeek.add(1, 'week');
    });
  }

  if (!state.overdue && state.selectWeek) {
    // TODO: Filter tasks that are overdue compared to the selectedWeek
  } else if (!state.overdue && state.selectDay) {
    // TODO: Filter tasks that are overdue compared to the selectedDay
  } else {
    // Filter task that are overdue compared to today
    filters.push((task: Task) => window.moment(task.due) < window.moment());
  }

  return filters;
};
