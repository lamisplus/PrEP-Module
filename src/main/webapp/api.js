export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMxOTU0ODczfQ.5mkc1oGcziejYVfeVb9AtwVhbapXGaarW4BrlIpsQQD9XwUKvR227DyUWwd0bLUfn9CUdTHU-TOJc_Wx4zBS_w'
    : new URLSearchParams(window.location.search).get('jwt');
