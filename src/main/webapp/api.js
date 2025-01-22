export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM3NDkzNjAyfQ.BgAkyxT2Oz34_R89fGF8LGLkLfMml1QWQrzgjwZoHS-mGLgqmzbSadHUy3kqgJHiAL9wpub4Lg0eOgLzIkLrnw'
    : new URLSearchParams(window.location.search).get('jwt');
