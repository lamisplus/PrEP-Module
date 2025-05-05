export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ2NDYyMjk1fQ.raXr-Q1VnBNxB8I4z4zo1iUBtfjIgXbGsXkrrVZz_TNULRM7h5Dy3jrMxUjzl_I0dgLpZ1d93hO6Uq7wJeC4sw'
    : new URLSearchParams(window.location.search).get('jwt');

export const wsUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8789/websocket'
    : '/websocket';
