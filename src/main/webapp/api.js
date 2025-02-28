export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQwNzkwNzY1fQ.9iRwUmkVr8Ioz37p9-zKeorWoEFhDhDxEb-DC69xtnKmH-rAcecU1W4FdXDAnDzOtOf65yG_nUxz6b6vSdfmZg'
    : new URLSearchParams(window.location.search).get('jwt');
