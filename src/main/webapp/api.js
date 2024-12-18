export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0NTQwNTk5fQ.1QasHyhlxxaU5oZ2nctDahzjCkBB3YysVgk1YWNGR8TIt5w66MP8WRe1YDbSjDKC9oEtE-5xWEG537J8wQiLRA'
    : new URLSearchParams(window.location.search).get('jwt');
