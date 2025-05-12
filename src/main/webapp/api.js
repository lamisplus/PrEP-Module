export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ3MDE2NzY1fQ.0BbSTxMv7zkHhMUlrCq8Gpy-bZf14ScZ_o7F4IPgk_xahFXhbMFWVpxY_bc9sIiRyePigj50x6iDDMu_eWAnsg'
    : new URLSearchParams(window.location.search).get('jwt');
