import { ApolloClient, split, HttpLink, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
const loc = window.location;

const httpLink = new HttpLink({
  uri: `${loc.protocol}//${loc.host}/graphql`,
});

const wsLink = new WebSocketLink({
  uri: `${loc.protocol === 'https:' ? 'wss:' : 'ws:'}//${loc.host}/graphql`,
  options: {
    reconnect: true,
  },
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});
