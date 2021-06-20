export interface ISettings {
  TasksDir: string;
  EnableEmbed: boolean;
}

const defaultSettings: ISettings = {
  TasksDir: 'tasks',
  EnableEmbed: false,
};

export const settingsWithDefaults = (
  settings: Partial<ISettings>,
): ISettings => ({ ...defaultSettings, ...settings });
