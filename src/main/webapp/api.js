export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ0OTI3OTgxfQ.EN290P5UhLuJl8AtNIQamVtpVBShtJmX9DH7nr6UOFUTUsVa_xqF0eoxpAK5treNc3Ujn1le3mcTqwsDIj2f-A'
    : new URLSearchParams(window.location.search).get('jwt');

export const wsUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8789/websocket'
    : '/websocket';
