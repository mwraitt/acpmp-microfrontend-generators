import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import './App.css';
import { makeTheme } from '@dls/react-theme';
import '@dls/react-fonts/index.css';
<% if (!options.router) { %>import GamePage from './pages/game-page';<% } %>
<% if (options.router) { %>import { BrowserRouter } from 'react-router-dom';
import { MainRoutes } from './routes/main-routes';<% } %>
<% if (options.graphql) { %>import { ApolloProvider } from '@apollo/client';
import { client as apolloClient } from './apollo/apollo-client';<% } %>

const theme = makeTheme({
  color: 'group-blue',
  tone: 'ultra-light',
  accent: 'orange',
});

function App() {
    return (
      <% if (options.graphql) { %><ApolloProvider client={apolloClient}> <% } %>

    <ThemeProvider
      theme={(props: any) => {
        return theme(props);
      }}

      <Page>
      <% if (options.router) { %><BrowserRouter>
        <MainRoutes />
      </BrowserRouter><% } %>
      <% if (!options.router) { %><GamePage /><% } %>
      </Page>
      </ThemeProvider>
      <% if (options.graphql) { %></ApolloProvider> <% } %>
  );
}

const Page = styled.div`
  > div { height: 100vh };
`;

export default App;
