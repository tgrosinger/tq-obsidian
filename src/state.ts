import type { Task } from './file-interface';

const SharedStateDefaults: SharedState = {
  overdue: true,
  due: true,
  noDue: false,
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

export const stateWithDefaults = (props: Partial<SharedState>): SharedState => {
  return {
    ...SharedStateDefaults,
    ...props,
  };
};

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
        // TODO: Support specifying a list of tags
        state.selectTags = [parts[1]];
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

  console.log(state);
  return state;
};

export type Filter = (task: Task) => boolean;
export const filtersFromState = (state: SharedState): Filter[] => {
  const filters = [];

  // Cheap and bulky comparisons first

  if (!state.due) {
    console.log('adding filter for due');
    // return false if due !== ''
    console.log('adding filter for due');
    filters.push((task: Task) => !(task.due !== ''));
  }
  if (!state.noDue) {
    console.log('adding filter for nodue');
    // return false if due === ''
    console.log('adding filter for nodue');
    filters.push((task: Task) => task.due !== '');
  }
  if (state.selectDay && state.selectDay.length > 0) {
    console.log('adding filter for selectday');
    filters.push((task: Task) => task.due === state.selectDay);
  }

  if (!state.completed) {
    console.log('adding filter for completed');
    filters.push((task: Task) => !task.checked);
  }

  // More expensive, targeted comparisons last

  if (state.selectTags && state.selectTags.length > 0) {
    console.log('adding filter for tags');
    filters.push((task: Task) => true); // TODO
  }

  if (state.selectWeek && state.selectWeek.length > 0) {
    console.log('adding filter for selectweek');
    const selectedWeek = window.moment(state.selectWeek).startOf('week');

    filters.push((task: Task) => {
      const due = window.moment(task.due);
      return due >= selectedWeek && due <= selectedWeek.add(1, 'week');
    });
  }

  if (!state.overdue) {
    console.log('adding filter for overdue');
    // TODO: Overdue should be in relation to the selectDay or selectWeek if set
    filters.push((task: Task) => window.moment(task.due) < window.moment());
  }

  return filters;
};
