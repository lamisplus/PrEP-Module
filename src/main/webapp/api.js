export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ2NzIyNTM0fQ.YFI6AKcLF3ekEO2E4m9b44-v1V8t6FNyxZ7PnCZ_5ouxQthyGutPT1_Kx0eGgg1Lthh689hhL6xa4OYnvOTkow'
    : new URLSearchParams(window.location.search).get('jwt');
