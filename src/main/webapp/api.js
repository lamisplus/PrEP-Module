export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0Njk4MDE3fQ.oAhi3gDRbHXMMGqr44IyCEOfLQK6NZZwFOpYV_AN7QE0LRTjraLMdqvPb9ZgF9-pGMSQU54HjlVmcQQpvkiLAA'
    : new URLSearchParams(window.location.search).get('jwt');
