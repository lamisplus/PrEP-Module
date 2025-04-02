export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQzNjQzNjIyfQ.Yc8rnfUDEmereCkgEFS7CmuQiXANvpj-Oj4c_Ev3s5DRDkll1eUIYVDymzQpanAGz3Qe-ol2pahwwbqAtephqg'
    : new URLSearchParams(window.location.search).get('jwt');
