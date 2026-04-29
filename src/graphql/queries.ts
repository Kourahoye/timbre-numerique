import { gql } from "@apollo/client";

// --- Query me ---
export const ME_QUERY = gql`
  query Me {
    me {
    username
    lastName
    firstName
    email
    id
  }
  }
`;

export const MY_TIMBRE_QUERY = gql`
  query MyTimbres {
  myTimbres {
    id
    qrCode
    reference
    used
    type {
      name
    }
  }
}
`;
export const SCAN = gql`
  query Scan($ref: String!) {
    scan(code: $ref) {
      id
    qrCode
    reference
    used
    type {
      name
    }
  }
}
`;   