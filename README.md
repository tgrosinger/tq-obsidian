# tq

tq is a plugin for [Obsidian](https://obsidian.md) for managing tasks using a
file-based workflow. Each task is represented as a Markdown note with a single
task line and some metadata in the frontmatter. For example:

```
---
due: '2021-06-30'
tags: 'work'
repeat: every Friday
completed:
  - '2021-06-18'
  - '2021-06-11'
---

- [ ] File TPS reports

```

Tasks can be viewed and edited from the tq view. In the future it will be
possible to embed task views in other notes.

This plugin is still under active development and is not yet feature complete.
It does however have the basic functionality, and I'll be adding more as needed
by my tasks workflow.

## Custom Blocks

In addition to using the tq UI, accessible from the ribbon icon, you can also
embed task queries in any note by using code blocks.

    ```tq
    select-day: 2021-06-06
    completed:  false
    overdue:    true
    ```

Or for a more complicated example:

    ```tq
    select-week: 2021-06-13
    select-tags: [ home, shopping ]
    completed: false
    group: due
    no-due: true
    ```

### Custom Block Properties

| Property      | Value                  | Description                                                  | Default   |
| ------------- | ---------------------- | ------------------------------------------------------------ | --------- |
| `select-day`  | Date                   | Include only tasks due this day                              | All tasks |
| `select-week` | Date                   | Include only tasks due this week                             | All tasks |
| `select-tags` | String List            | Include only tasks with this tag (can be used with day/week) | All tasks |
| `overdue`     | true/false             | Include tasks which are considered overdue                   | true      |
| `completed`   | true/false             | Include tasks which are checked                              | true      |
| `due`         | true/false             | Include tasks which have a due date                          | true      |
| `no-due`      | true/false             | Include tasks which do not have a due date                   | false     |
| `sort`        | "score", "due", ""     | Specify the sort order of the tasks                          | ""        |
| `group`       | "due", "completed", "" | Specify how tasks should be grouped in the list              | ""        |

## Obsidian Links and Shortcuts

You may use Obsidian links to interact with tq from within or outside of the app.

### Creating Tasks

```
obsidian://tq?action=create&due=2021-06-01&task=Water%20the%20garden
```

Properties must be URL escaped.

| Property | Value    | Description                          |
| -------- | -------- | ------------------------------------ |
| action   | "create" | Indicate a task is being created     |
| due      | Date     | An optional due date for the task    |
| task     | String   | The URL escaped contents of the task |
| repeat   | String   | The repeat configuration             |

### Using iOS Shortcuts

The URL above can be used from iOS Shortcuts to create a quick way to add tasks
from outside of Obsidian. Note however that if you are using Obsidian Sync, your
task may not be synced unless you leave Obsidian open long enough to complete.

Example coming soon.

## Pricing

This plugin is provided to everyone for free, however if you would like to
say thanks or help support continued development, feel free to send a little
my way through one of the following methods:

[![GitHub Sponsors](https://img.shields.io/github/sponsors/tgrosinger?style=social)](https://github.com/sponsors/tgrosinger)
[![Paypal](https://img.shields.io/badge/paypal-tgrosinger-yellow?style=social&logo=paypal)](https://paypal.me/tgrosinger)
[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/tgrosinger)

## Screenshots

So far the majority of my effort has been focused on functionality, so the UI
has some very rough edges. It will hopefully improve over time!

![task list](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/task-list.png)

![create-task](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/create-task.png)

![edit task repeat](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/edit-repeat.png)

![task details](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/expanded-task.png)
