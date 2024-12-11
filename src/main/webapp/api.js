export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMzODU4MjA2fQ.vmPDmSitvS-eWsOzoY6JjGIeV30JKjGIyvMsczfudtZPsTtgyDVKd94mxYDEYN3bTWHMnF4g2hbz7e7kECI6Kw'
    : new URLSearchParams(window.location.search).get('jwt');
