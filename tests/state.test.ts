import type { Task } from '../src/file-interface';
import { Frontmatter } from '../src/frontmatter';
import { filtersFromState, stateFromConfig } from '../src/state';
import { every, filter } from 'lodash';
import moment from 'moment';

const makeTask = (lineIdx: number, md: string[]): Task => {
  const frontmatter = new Frontmatter(md);
  const due = frontmatter.get('due');
  return {
    file: undefined,
    md: md.join('\n'),
    frontmatter,
    line: md[lineIdx].replace(/- \[[x ]\]/, ''),
    checked: md[lineIdx].startsWith('- [x]'),
    due: due ? moment(due).endOf('day') : undefined,
    urgent: false, // TODO: Include in tests
    important: false, // TODO: Include in tests
  };
};

const task1 = makeTask(0, ['- [ ] no due here']);
const task2 = makeTask(0, ['- [x] completed no due here']);
const task3 = makeTask(4, [
  '---',
  'due: "2021-06-06"',
  'tags: work',
  '---',
  '- [x] completed with due',
]);
const task4 = makeTask(4, [
  '---',
  'due: "2021-06-06"',
  'tags: [home]',
  '---',
  '- [ ] incomplete with due',
]);
const task5 = makeTask(3, [
  '---',
  'tags: [work]',
  '---',
  '- [ ] incomplete with tag',
]);
const task6 = makeTask(3, [
  '---',
  'due: "2021-06-15"',
  '---',
  '- [ ] incomplete with later due',
]);
const task7 = makeTask(3, [
  '---',
  'tags: [work/meetings]',
  '---',
  '- [ ] incomplete with nested tag 1',
]);
const task8 = makeTask(3, [
  '---',
  'tags: [work/email]',
  '---',
  '- [ ] incomplete with nested tag 2',
]);

const applyFilters = (tasks: Task[], config: string[]): Task[] => {
  const state = stateFromConfig(config);
  const allFilters = filtersFromState(state);
  return filter(tasks, (t) => every(allFilters, (f) => f(t)));
};

beforeAll(() => {
  window.moment = moment;
});

describe('when filtering tasks', () => {
  describe('when filtering by completed', () => {
    test('when not including completed', () => {
      const config = ['completed: false'];
      const filtered = applyFilters([task1, task2, task3], config);
      expect(filtered).toEqual([task1]);
    });
    test('when only including completed', () => {
      const config: string[] = ['completed: true'];
      const filtered = applyFilters([task1, task2, task3], config);
      expect(filtered).toEqual([task2, task3]);
    });
    test('when including either', () => {
      const config: string[] = [];
      const filtered = applyFilters([task1, task2, task3], config);
      expect(filtered).toEqual([task1, task2, task3]);
    });
  });
  describe('when filtering to a single day', () => {
    test('basic selectDay', () => {
      const config = ['select-day: 2021-06-06'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task6],
        config,
      );
      expect(filtered).toEqual([task1, task2, task3, task4]);
    });
    test('with only incomplete', () => {
      const config = ['select-day: 2021-06-06', 'completed: false'];
      const filtered = applyFilters([task1, task2, task3, task4], config);
      expect(filtered).toEqual([task1, task4]);
    });
    test('with complete and incomplete', () => {
      const config = ['select-day: 2021-06-06'];
      const filtered = applyFilters([task1, task2, task3, task4], config);
      expect(filtered).toEqual([task1, task2, task3, task4]);
    });
    test('with a tag', () => {
      const config = [
        'select-day: 2021-06-06',
        'completed: true',
        'select-tags: work',
      ];
      const filtered = applyFilters([task1, task2, task3, task4], config);
      expect(filtered).toEqual([task3]);
    });
    test('with two tags', () => {
      const config = ['select-day: 2021-06-06', 'select-tags: [work, home]'];
      const filtered = applyFilters([task1, task2, task3, task4], config);
      expect(filtered).toEqual([task3, task4]);
    });
    test('omitting a tag', () => {
      const config = ['omit-tags: work', 'no-due:false'];
      const filtered = applyFilters([task1, task2, task3, task4], config);
      expect(filtered).toEqual([task4]);
    });
    test('with only due', () => {
      const config = ['select-day: 2021-06-06', 'no-due: false'];
      const filtered = applyFilters([task1, task2, task3, task4], config);
      expect(filtered).toEqual([task3, task4]);
    });
  });
  describe('when only tasks with no due date', () => {
    test('all', () => {
      const config = ['no-due: true', 'due: false'];
      const filtered = applyFilters([task1, task2, task3, task4], config);
      expect(filtered).toEqual([task1, task2]);
    });
    test('for a tag', () => {
      const config = ['no-due: true', 'due: false', 'select-tags: work'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task5],
        config,
      );
      expect(filtered).toEqual([task5]);
    });
  });
  describe('including overdue', () => {
    test('for a specific day', () => {
      const config = ['select-day: 2021-06-15', 'overdue: true'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task5, task6],
        config,
      );
      expect(filtered).toEqual([task1, task2, task4, task5, task6]);
    });
    test('for a specific week', () => {
      const config = ['select-week: 2021-06-14', 'overdue: true'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task5, task6],
        config,
      );
      expect(filtered).toEqual([task1, task2, task3, task4, task5, task6]);
    });
  });
  describe('when filtering to a single week', () => {
    test('basic select-week', () => {
      const config = ['select-week: 2021-06-14'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task5],
        config,
      );
      expect(filtered).toEqual([task1, task2, task5]);
    });
    test('with only due', () => {
      const config = ['select-week: 2021-06-14', 'no-due: false'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task5, task6],
        config,
      );
      expect(filtered).toEqual([task6]);
    });
  });
  describe('when filtering with nested tags', () => {
    test('when using a child tag', () => {
      const config = ['select-tags: work/email'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task5, task6, task7, task8],
        config,
      );
      expect(filtered).toEqual([task8]);
    });
    test('when using a parent tag', () => {
      const config = ['select-tags: work'];
      const filtered = applyFilters(
        [task1, task2, task3, task4, task5, task6, task7, task8],
        config,
      );
      expect(filtered).toEqual([task3, task5, task7, task8]);
    });
  });
});
