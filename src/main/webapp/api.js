export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI5ODk1Nzc4fQ.4HUF0yfIY_EPn4tFMW-zkThZZcy45OU9fUkuy-Z9deYAqNsAeNgagsdMX14PFCPLcnE0daLAxb-DL5nJVE-Bvw'
    : new URLSearchParams(window.location.search).get('jwt');
