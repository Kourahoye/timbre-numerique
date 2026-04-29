import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { REFRESH_TOKEN_MUTATION } from './graphql/mutations';
import { getTokens, storeTokens } from './services/manageTokens';

// --- Client pour refresh uniquement ---
const refreshClient = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:8000/graphql/" }),
  cache: new InMemoryCache(),
});

// --- Auth Link ---
const authLink = new ApolloLink((operation, forward) => {
  const tokens = getTokens();
  if (tokens?.accessToken) {
    operation.setContext({
      headers: {
        Authorization: `JWT ${tokens.accessToken}`,
      },
    });
  }
  return forward(operation);
});

const errorLink = new ErrorLink(({ error, operation,forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message }) =>{
      // console.log(`===================================================================\n ${message}`)
      if (message.includes("Unauthenticated")) {
        const _tokens = getTokens();
        return refreshClient.mutate({
          mutation: REFRESH_TOKEN_MUTATION,
          variables: { refreshToken: _tokens.refreshToken },
        }).then(({ data }) => {
          // console.log(`[GraphQL debug from conf =================]: Message: ${data}`)
          // const typedData = data as { refreshToken: { token: { token: string } } };
          const accessToken = data.refreshToken.token.token;
          const refreshToken = data.refreshToken.refreshToken.token;
          storeTokens(accessToken, refreshToken);

          // Mettre à jour le header de l'opération initiale
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              Authorization: `JWT ${accessToken}`,
            }
          }));
          console.log(
              `[GraphQL error from conf]: Message: ${message}`
            )
          return forward(operation);
          }
    );
  } else if (CombinedProtocolErrors.is(error)) {
    error.errors.forEach(({ message, extensions }) =>
      console.log(
        `[Protocol error from conf]: Message: ${message}, Extensions: ${JSON.stringify(
          extensions
        )}`
      )
    );
  } else {
    console.error(`[Network error]: ${error}`);
  }
});
  return forward(operation);
}});

// --- Client principal ---
const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, new HttpLink({ uri: "http://localhost:8000/graphql/" }),]),
  cache: new InMemoryCache(),
});

export default apolloClient;
