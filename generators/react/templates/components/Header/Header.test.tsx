import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Header } from '.';

test('loads and displays 2 tabs', async () => {
  const { getByText } = render(<Header />);
  const home = getByText(/Home/);
  const tab1 = getByText(/Tab 1/);
  expect(home).toBeInTheDocument();
  expect(tab1).toBeInTheDocument();
});
