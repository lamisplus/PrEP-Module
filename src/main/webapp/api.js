export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQwNDk4ODUxfQ.NKcXhk73L1sVfpNf-WUipGxdvOzil9YzXtHmFoDzzE2khux3glh0zoSvBNNF6sUWX6pQFKYZoNMjIxiB2Jxl9w'
    : new URLSearchParams(window.location.search).get('jwt');
