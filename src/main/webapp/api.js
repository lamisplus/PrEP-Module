export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQwNjg1NDI4fQ.un9cI9EbO_1XAa47sybt-B4CDKsNThPriHIrXFmDe3UZKzNroIbjYf7_D-79eIrQR1P2AbExyv49uhmTV5fYuw'
    : new URLSearchParams(window.location.search).get('jwt');
