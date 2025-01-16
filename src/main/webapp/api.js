export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM3MDE2MzYxfQ.el-Fck7qLq9x8BZJSN0TYREQSqTchK3myY-Em6TS4uOOshKx2FvvoMHX8GOTvy8raCeWTR8cqGqBeqwbOOV_iw'
    : new URLSearchParams(window.location.search).get('jwt');
