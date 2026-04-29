/**
 * Retrieve tokens from localStorage
 */
export function getTokens() {
  const access = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');
  
  return {
    accessToken: access,
    refreshToken: refresh,
  };
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access', accessToken);
  localStorage.setItem('refresh', refreshToken);
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}