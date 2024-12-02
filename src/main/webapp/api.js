export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMyMjg1MDk5fQ.fF1vTvhTEZ4azuF7DdE1ZvRalaiI4cLmavDyu-k8RLOIFtskihj3yyOBZJd-llt9Hzf2IulexqotCOSrPchwmA'
    : new URLSearchParams(window.location.search).get('jwt');
