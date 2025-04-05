export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQzODg0NzgwfQ.a7mDL85QrxwE1OrjAyHclwGsBEP79THPE9-Unz5h9fJoHQG7ht1dH3KiX1fTEUjbFdgLKbaywCbnmpxTeAYvfQ'
    : new URLSearchParams(window.location.search).get('jwt');
