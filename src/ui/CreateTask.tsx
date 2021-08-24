import React from 'react';
import TQPlugin from '../main';
import styled from 'styled-components';

const taskPlaceholders = [
  'Feed the chickens',
  'Unclog the toilet',
  'Paint the house',
  'Weed the garden',
  'Water the orchard',
];

const DateInput = styled.input`
  background: var(--background-modifier-form-field);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  padding: 5px 14px;
  font-size: 16px;
  border-radius: 4px;
  outline: none;
  height: 30px;
  ::-webkit-calendar-picker-indicator {
    color: var(--text-normal);
  }
  ::-webkit-datetime-edit-month-field {
    text-transform: uppercase;
  }
`;

const getPlaceholder = (): string => {
  const idx = Math.floor(Math.random() * taskPlaceholders.length);
  return taskPlaceholders[idx];
};

export const CreateTask: React.FC<{
  close: () => void;
  plugin: TQPlugin;
}> = ({ close, plugin }): JSX.Element => {
  const [placeholder, _] = React.useState(getPlaceholder);
  const [description, setDescription] = React.useState('');
  const [due, setDue] = React.useState('');
  const [hideUntil, setHideUntil] = React.useState('');
  const [repeats, setRepeats] = React.useState(false);
  const [repeatConfig, setRepeatConfig] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [important, setImportant] = React.useState(false);
  const [urgent, setUrgent] = React.useState(false);

  const save = () => {
    const cleanedTags = tags
      .split(/[, ]/)
      .filter((x) => x !== '')
      .map((tag) => tag.trim().replace('#', ''));
    plugin.fileInterface.storeNewTask(
      description,
      due,
      hideUntil,
      repeats ? repeatConfig : '',
      cleanedTags,
      urgent,
      important,
    );
    close();
  };

  return (
    <>
      <div>
        <label>
          Description
          <input
            id="task-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholder}
          />
        </label>
      </div>
      <div>
        <label>
          Due
          <DateInput
            id="due-date"
            type="date"
            placeholder="No due date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            // Look into https://dev.to/codeclown/styling-a-native-date-input-into-a-custom-no-library-datepicker-2in
          />
        </label>
      </div>
      <div>
        <label>
          Hide Until
          <DateInput
            id="hide-until-date"
            type="date"
            placeholder=""
            value={hideUntil}
            onChange={(e) => setHideUntil(e.target.value)}
            // Look into https://dev.to/codeclown/styling-a-native-date-input-into-a-custom-no-library-datepicker-2in
          />
        </label>
      </div>
      <div>
        <label>
          Tags
          <input
            // TODO: Add text suggest for tag values
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={important}
            onChange={(e) => setImportant(e.target.checked)}
          />
          Important
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
          />
          Urgent
        </label>
      </div>

      <button onClick={save}>Save</button>
    </>
  );
};
