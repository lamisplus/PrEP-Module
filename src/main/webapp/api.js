export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMxNTAyMDYxfQ.PUzk1FiJ561wj7sUB7_k4vbBvr9gbpwrT4O9LbGNAqA_34d86pLmnf0N2C1LA1dLjf6AQvTZPq2GEqnwz38AtQ'
    : new URLSearchParams(window.location.search).get('jwt');
