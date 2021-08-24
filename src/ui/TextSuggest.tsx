import { App } from 'obsidian';
import React from 'react';
import { StaticSuggest } from '../suggest';

export const TextSuggest: React.FC<{
  app: App;
  suggestions: string[];
}> = ({ app, suggestions }): JSX.Element => {
  const ref = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    new StaticSuggest(app, ref.current, suggestions);
  }, []);

  return <input type="text" ref={ref} />;
};
