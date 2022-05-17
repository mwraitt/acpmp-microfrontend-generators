import { makeTheme } from '@dls/react-theme';
import React, { useState } from 'react';
import { AppBar, Tabs, Tab } from '@dls/react-core';
import { ThemeProvider } from 'styled-components';

export const Header = () => {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const theme = makeTheme({
    tone: 'bright',
  });

  return (
    <ThemeProvider
      theme={(props: any) => {
        return theme(props);
      }}
    >
      <AppBar position="static" color={'primary'}>
        <Tabs value={value} onChange={handleChange as any} aria-label="simple tabs example">
          <Tab label="Home" className="navigation" />
          <Tab label="Tab 1" className="navigation" />
        </Tabs>
      </AppBar>
    </ThemeProvider>
  );
};
