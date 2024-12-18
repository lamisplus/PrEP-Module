export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0NDY2Nzg1fQ.L4hSvRPUcFKIHTn_bMuRmD0ehE6jnh5jdftV05CW4-xaoxnE2YXgIyLnCAojm9w03FcY15FD-GN9Y3NeFyS1NA'
    : new URLSearchParams(window.location.search).get('jwt');
