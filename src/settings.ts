export interface ISettings {
  TasksDir: string;
}

const defaultSettings: ISettings = {
  TasksDir: 'tasks',
};

export const settingsWithDefaults = (
  settings: Partial<ISettings>,
): ISettings => ({ ...defaultSettings, ...settings });
