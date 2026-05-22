import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { REFRESH_TOKEN_MUTATION } from './graphql/mutations';
import { getTokens, storeTokens } from './services/manageTokens';
import i18n from './i18n';

// --- Client pour refresh uniquement ---
const refreshClient = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:8000/graphql/" }),
  cache: new InMemoryCache(),
});

const authLink = new ApolloLink((operation, forward) => {
  const tokens = getTokens();
  const lang = i18n.language?.slice(0, 2) ?? 'fr';

  operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
    headers: {
      ...headers,
      ...(tokens?.accessToken && { Authorization: `JWT ${tokens.accessToken}` }),
      'Accept-Language': lang,   // ✅ "fr" ou "en", jamais "fr-FR"
    },
  }));

  return forward(operation);
});

const errorLink = new ErrorLink(({ error, operation,forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message }) =>{
      if (message.includes("Unauthenticated")) {
        apolloClient.clearStore();
        localStorage.removeItem("me")
        const _tokens = getTokens();
        return refreshClient.mutate({
          mutation: REFRESH_TOKEN_MUTATION,
          variables: { refreshToken: _tokens.refreshToken },
        }).then(({ data }) => {
          const accessToken = data.refreshToken.token.token;
          const refreshToken = data.refreshToken.refreshToken.token;
          storeTokens(accessToken, refreshToken);
          const lang = i18n.language?.slice(0, 2) ?? 'fr';
          // Mettre à jour le header de l'opération initiale
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              Authorization: `JWT ${accessToken}`,
              'Accept-Language':lang,
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
