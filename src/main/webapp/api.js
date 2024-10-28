export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMwMTQ0NjY0fQ.CQevRSqXKQhRLg2rf9n6uUx8w3F3ob_B1W96ZZ31Fjl8pv6GjhTis9_lwg_mC8lLTldvm37MNxdZuNBMR0k7Gw'
    : new URLSearchParams(window.location.search).get('jwt');
