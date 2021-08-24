import { Dictionary, every, filter, forEach, groupBy, sortBy } from 'lodash';
import React from 'react';
import { TaskListTask } from './TaskListTask';
import { Task } from '../file-interface';
import type TQPlugin from '../main';
import { filtersFromConfig, TaskListConfig } from '../state';

const getGrouper = (state: TaskListConfig): ((t: Task) => string) => {
  switch (state.group) {
    case 'due':
      return (t) => t.due?.format('YYYY-MM-DD') || 'No Due Date';
    case 'completed':
      return (t) => (t.checked ? 'Complete' : 'Incomplete');
    default:
      return (_) => undefined;
  }
};

const getKeySorter = (state: TaskListConfig): ((k: string) => any) => {
  const re = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.compile();
  switch (state.group) {
    case 'due':
      return (k): any => (re.test(k) ? window.moment(k) : undefined);
    case 'completed':
      return (k): any => (k === 'Complete' ? -1 : 1);
    default:
      return (_): any => 0;
  }
};

const getTaskSorter = (
  state: TaskListConfig,
): ((a: Task, b: Task) => number) => {
  switch (state.sort) {
    case 'due':
      return (a, b) => window.moment(a.due).diff(window.moment(b.due));
    case 'score':
      return (a, b) => a.calcTaskScore() - b.calcTaskScore();
    default:
      return (a, b) => 0;
  }
};

const filterAndGroupTasks = (
  config: TaskListConfig,
  tasks: Task[],
): Dictionary<Task[]> => {
  const allFilters = filtersFromConfig(config);
  const filteredTasks = filter(tasks, (t) => every(allFilters, (f) => f(t)));
  const grouper = getGrouper(config);
  const tasksGrouped = groupBy(filteredTasks, grouper);

  const taskSorter = getTaskSorter(config);
  forEach(tasksGrouped, (val) => {
    val.sort(taskSorter);
  });

  return tasksGrouped;
};

const getSortedKeys = (
  config: TaskListConfig,
  tasksGrouped: Dictionary<Task[]>,
): string[] => {
  const keySorter = getKeySorter(config);
  const groupKeys = Object.keys(tasksGrouped);
  return sortBy(groupKeys, keySorter);
};

export const TasksListGroup: React.FC<{
  plugin: TQPlugin;
  groupName: string;
  tasks: Task[];
}> = ({ plugin, groupName, tasks }): JSX.Element => {
  return (
    <div>
      {groupName !== 'undefined' ? <h3>{groupName}</h3> : undefined}
      {tasks.map((task) => (
        <TaskListTask key={task.file.path} plugin={plugin} task={task} />
      ))}
    </div>
  );
};

export const TasksUI: React.FC<{
  plugin: TQPlugin;
  config: TaskListConfig;
}> = ({ plugin, config, children }): JSX.Element => {
  const tasks = plugin.useTaskState();
  const filteredGroupedTasks = filterAndGroupTasks(config, tasks);
  const sortedKeys = getSortedKeys(config, filteredGroupedTasks);

  return (
    <div>
      {sortedKeys.map((key) => (
        <TasksListGroup
          key={key}
          plugin={plugin}
          groupName={key}
          tasks={filteredGroupedTasks[key]}
        />
      ))}

      {children}
    </div>
  );
};
