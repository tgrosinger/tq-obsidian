# tq

tq is a plugin for [Obsidian](https://obsidian.md) for managing tasks using a
file-based workflow. Each task is represented as a Markdown note with a single
task line and some metadata in the frontmatter. Tasks are viewed by embedding
queries in other notes, such as your Daily Note.

![tq demo](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/tq-demo.gif)

An example task note:

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

This plugin is still under active development and is not yet feature complete.
It does however have the basic functionality, and I'll be adding more as needed
by my tasks workflow.

## Custom Blocks

Tasks can be queried by using custom code blocks in notes. Here's an example
which would include any tasks for the specified date or which are overdue (in
relation to that date). It will also omit any tasks which have been completed.

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
| `omit-tags`   | String List            | Exclude tasks with this tag (can be used with day/week)      | Omit none |
| `overdue`     | true/false             | Include if task is overdue in relation to selected day/week  | false     |
| `completed`   | true/false             | Include only tasks which are checked or not checked. If completed is not provided, then both completed and incomplete tasks are shown. If set to true, then only completed tasks are shown, and if false then only incomplete tasks are shown.          | All tasks |
| `due`         | true/false             | Include tasks which have a due date                          | true      |
| `no-due`      | true/false             | Include tasks which do not have a due date                   | true      |
| `sort`        | "score", "due", ""     | Specify the sort order of the tasks                          | ""        |
| `group`       | "due", "completed", "" | Specify how tasks should be grouped in the list              | ""        |

Note that `select-tags` and `omit-tags` support nested tags. In other words,
`select-tags: work` will match notes tagged with `work` as well as
`work/meetings`

## Obsidian Links and Shortcuts

You may use Obsidian links to interact with tq from within or outside of the app.

### Creating Tasks

```
obsidian://tq?create&due=2021-06-01&task=Water%20the%20garden
```

Properties must be URL escaped.

| Property | Value    | Description                          |
| -------- | -------- | ------------------------------------ |
| action   | "create" | Indicate a task is being created     |
| due      | Date     | An optional due date for the task    |
| task     | String   | The URL escaped contents of the task |
| repeat   | String   | The URL escaped repeat configuration |
| tags     | String   | Comma separated list of tags         |

### Using iOS Shortcuts

The URL above can be used from iOS Shortcuts to create a quick way to add tasks
from outside of Obsidian. Note however that if you are using Obsidian Sync, your
task may not be synced unless you leave Obsidian open long enough to complete.

[Example Shortcut](https://www.icloud.com/shortcuts/ea7991d02bc24922ace9b49c670a1397)

https://user-images.githubusercontent.com/597386/124496753-adfb4a00-dd6e-11eb-830f-3dd2cd87cc66.mp4

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

![create-task](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/create-task.png)

![edit task repeat](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/edit-repeat.png)

![task details](https://raw.githubusercontent.com/tgrosinger/tq-obsidian/main/resources/screenshots/expanded-task.png)
