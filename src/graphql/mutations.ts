import { gql } from '@apollo/client';

// --- Mutation refresh ---
export const REFRESH_TOKEN_MUTATION = gql `
  mutation RefreshToken($refreshToken: String!)  {
    refreshToken(refreshToken: $refreshToken,revokeRefreshToken: false) {
      refreshToken {
      token
    }
    success
    errors
    token {
      token
    }
  }
  }
`;


export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $username: String!, $password1: String!, $password2: String!) {
    register(
      email: $email
      username: $username
      password1: $password1
      password2: $password2
    ) {
      success
      errors
    }
  }
`;


export const LOGIN_MUTATION = gql`
mutation Login($username: String!, $password: String!) {
  tokenAuth(username: $username, password: $password) {
      success
      errors
      token {
        token
      }
    refreshToken {
        token
      }
      user {
        id
        username
        verified
        isActive
      }
    }
  }
`;

