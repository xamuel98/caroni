import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { TooltipProvider } from '../src';
import '../src/storybook.css';

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as string;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={300}>
      <div className="bg-bg font-sans text-text antialiased">
        <Story />
      </div>
    </TooltipProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Caroni theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'centered',
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
