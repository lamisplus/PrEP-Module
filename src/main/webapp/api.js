export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM2NDM3NzM1fQ.tnV9AdGd0c6I7fX714n7wNgYle4UAiQK5gCAL4Q-u5K0ukdKMWgyCYzuH8f66r0rEV5G3EzMHfl0JBQPFokJFw'
    : new URLSearchParams(window.location.search).get('jwt');
