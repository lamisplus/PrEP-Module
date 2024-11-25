export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMyNDQ2MDg1fQ.3udEBoASo2qGpjW5P3SlAtGy4Lz2gGPClTYtJ8DhaCJbxT4V0OIjZDu8OMQqwabK17NFAbfq3KVvzrG533ehOg'
    : new URLSearchParams(window.location.search).get('jwt');
