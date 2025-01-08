export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM2MzMxNTc5fQ.TQq9qWZrT5lOEW16IfN4jY5VlFwX_LfPQ75pDlc6g4L2petaLRHKyGHmKXW0elhlKeJx3TG7kJJMq3e-QwQncA'
    : new URLSearchParams(window.location.search).get('jwt');

export const wsUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8789/websocket'
    : '/websocket';
