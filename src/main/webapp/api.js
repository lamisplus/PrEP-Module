export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0MTM1NTUzfQ.5IpmbzNPBC3X62V6bpWPg_U4Y8uMXOtdX-uQCgklYdzVZAvDLeOx7HrPPKDqKKIkj_jIqMXDyiId777hBd9WcQ'
    : new URLSearchParams(window.location.search).get('jwt');
