export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0MjkzNTU2fQ.EfypCHc8M-d6f0JboCTv3UGjxydnQGQud5aChhHH6gfZG3l57EFVToLxbFi4lNu-tzkfumpuplIvjC0uT2nPCA'
    : new URLSearchParams(window.location.search).get('jwt');
