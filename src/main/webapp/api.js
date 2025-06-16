export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUwMDk5NTc5fQ.dJp427XBcBGTWy3fI2mWzSne-d-4XlcAhmZGEpKX1Svq9JwFCvsYm6q0Vqi_l-TfypsX90Ej9S_QSIMIa-R19Q'
    : new URLSearchParams(window.location.search).get('jwt');
