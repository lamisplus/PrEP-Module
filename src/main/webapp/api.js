export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMxMzYyMDc3fQ.OK0rv87LqKS6cG9wa3lgXl2Q9KE7wMO35WgYM0bN4T6BcPnvLF89Pniu3U-2rwfwSKKM_g_h-CMDflYFY4quPg'
    : new URLSearchParams(window.location.search).get('jwt');
