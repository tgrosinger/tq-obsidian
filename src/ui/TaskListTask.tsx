import { App, TFile } from 'obsidian';
import React from 'react';
import TQPlugin from '../main';
import styled from 'styled-components';
import { Task } from '../file-interface';

const TaskRow = styled.div`
  background-color: var(--background-secondary);
  border-bottom: thin solid var(--background-modifier-border);
  padding: 5px;
`;

const ExpandedTaskRow = styled.div`
  background-color: var(--background-secondary);
  border-bottom: thin solid var(--background-modifier-border);
  padding: 5px;
  margin: 10px 0;
`;

const TaskRowHeader = styled.div`
  display: flex;
`;

const TaskLineText = styled.span`
  flex: 1;
`;

const TaskRowIcon = styled.span`
  margin: 0 5px;
`;

const Label = styled.span`
  width: 150px;
  display: inline-block;
`;

const Value = styled.input`
  width: 300px;
`;

const OverdueIndicator: React.FC<{ task: Task }> = ({ task }): JSX.Element => {
  if (!task.checked && task.due?.isBefore(window.moment())) {
    const title = `Due ${task.due.format('YYYY-MM-DD')}`;
    return (
      <TaskRowIcon>
        <span title={title}>
          <svg
            fill="var(--text-error)"
            width="18"
            height="18"
            version="1.1"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m4 0v2h-1c-1.11 0-2 0.89-2 2v14c0 1.11 0.9 2 2 2h14c1.11 0 2-0.89 2-2v-14c0-1.1-0.89-2-2-2h-1v-2h-2v2h-8v-2h-2m-1 7h14v11h-14v-12m6 2v5h2v-5h-2m0 7v2h2v-2z" />
          </svg>
        </span>
      </TaskRowIcon>
    );
  }

  return null;
};

const ExpandTaskRowButton: React.FC<{
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ expanded, setExpanded }): JSX.Element => {
  const icon = (
    <svg
      fill="var(--text-muted)"
      width="12"
      height="12"
      version="1.1"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      style={expanded ? { transform: 'rotate(180deg)' } : {}}
    >
      <path d="m10.293 2.4395-4.293 4.293-4.293-4.293-1.414 1.414 5.707 5.707 5.707-5.707z" />
    </svg>
  );

  return (
    <TaskRowIcon>
      <span
        title={expanded ? 'Hide details' : 'See details'}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {icon}
      </span>
    </TaskRowIcon>
  );
};

const ViewNoteButton: React.FC<{
  app: App;
  file: TFile;
}> = ({ app, file }): JSX.Element => {
  const showNote = () => {
    let leaf = app.workspace.activeLeaf;
    if (leaf.getViewState().pinned) {
      leaf = app.workspace.createLeafBySplit(leaf);
    }
    leaf.openFile(file);
  };

  return (
    <TaskRowIcon>
      <span title="View note" onClick={showNote}>
        <svg
          fill="var(--text-muted)"
          width="18"
          height="18"
          version="1.1"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m10 0 3.293 3.293-7 7 1.414 1.414 7-7 3.293 3.293v-8z" />
          <path d="m16 16h-14v-14h7l-2-2h-5c-1.103 0-2 0.897-2 2v14c0 1.103 0.897 2 2 2h14c1.103 0 2-0.897 2-2v-5l-2-2z" />
        </svg>
      </span>
    </TaskRowIcon>
  );
};

const HideTaskButton: React.FC<{
  task: Task;
}> = ({ task }): JSX.Element => {
  const hideTask = () => {
    console.log('Should hide');
  };

  return (
    <span title="Hide task" onClick={hideTask}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="var(--text-muted)"
      >
        <path d="M12 19c.946 0 1.81-.103 2.598-.281l-1.757-1.757c-.273.021-.55.038-.841.038-5.351 0-7.424-3.846-7.926-5a8.642 8.642 0 0 1 1.508-2.297L4.184 8.305c-1.538 1.667-2.121 3.346-2.132 3.379a.994.994 0 0 0 0 .633C2.073 12.383 4.367 19 12 19zm0-14c-1.837 0-3.346.396-4.604.981L3.707 2.293 2.293 3.707l18 18 1.414-1.414-3.319-3.319c2.614-1.951 3.547-4.615 3.561-4.657a.994.994 0 0 0 0-.633C21.927 11.617 19.633 5 12 5zm4.972 10.558-2.28-2.28c.19-.39.308-.819.308-1.278 0-1.641-1.359-3-3-3-.459 0-.888.118-1.277.309L8.915 7.501A9.26 9.26 0 0 1 12 7c5.351 0 7.424 3.846 7.926 5-.302.692-1.166 2.342-2.954 3.558z" />
      </svg>
    </span>
  );
};

const Drawer: React.FC<{
  expanded: boolean;
}> = ({ expanded, children }): JSX.Element =>
  expanded ? <div>{children}</div> : null;

export const TaskListTask: React.FC<{
  plugin: TQPlugin;
  task: Task;
}> = ({ plugin, task }): JSX.Element => {
  // TODO: Can I put the `useState` in the object and share between instances?
  const [checked, setChecked] = React.useState(task.checked);
  const [expanded, setExpanded] = React.useState(false);

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    task.setChecked(e.target.checked);
  };

  const completed = task.frontmatter.get('completed');
  const lastCompleted = completed ? completed[completed.length - 1] : undefined;

  const rowContent = (
    <>
      <TaskRowHeader>
        <input type="checkbox" checked={checked} onChange={handleChecked} />
        <TaskLineText>{task.line}</TaskLineText>
        <OverdueIndicator task={task} />
        <HideTaskButton task={task} />
        <ViewNoteButton app={plugin.app} file={task.file} />
        <ExpandTaskRowButton expanded={expanded} setExpanded={setExpanded} />
      </TaskRowHeader>
      <Drawer expanded={expanded}>
        <div>
          <Label>Due:</Label>
          <Value type="text" value="No due date" />
        </div>

        <div>
          <Label>Repeat Schedule:</Label>
          <Value type="text" value="Does not repeat" />
        </div>

        {lastCompleted ? (
          <div>
            <Label>Last Completed:</Label>
            <Value type="text" value={lastCompleted} disabled />
          </div>
        ) : undefined}
      </Drawer>
    </>
  );

  return expanded ? (
    <ExpandedTaskRow>{rowContent}</ExpandedTaskRow>
  ) : (
    <TaskRow>{rowContent}</TaskRow>
  );
};
