export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI4NDAwODE5fQ.JbfZO2CUBoil__nMHTRyngma1Yzu6cGWJc87Yq7wvsIOV_4kxFtUySaN4_aZEw4W4fkP_RIpHSwkZzuOqOFQFA'
    : new URLSearchParams(window.location.search).get('jwt');
