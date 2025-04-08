export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ0MTMzNTY4fQ.HnNXn41t4jKRQb0ZE9ux0pMWyQ1_IEVE6FDwRlk9vRerv7OC2OXfT7FEFtsiIJ_bVto8kLqSmmSr9cowrUilcg'
    : new URLSearchParams(window.location.search).get('jwt');
