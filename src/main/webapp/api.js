export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ1NTA2OTY3fQ.oX_qTdJdMOrM_EvlDrish6bPKcsp2tKm3mIilPOef8sFbWhJsLGlW6fLiPCr5qgTosJWotz-YVU2DIA6ftWjbg'
    : new URLSearchParams(window.location.search).get('jwt');
