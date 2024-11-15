export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMxNjc5MDM4fQ.yZssjoJPFlmQsBhirAebgPIo92VZJZKaytsLr2q3pKqawdtJKfjyqpvHYdbWG1kjWZ62w-N4Q6OZhJ8jjPLO4Q'
    : new URLSearchParams(window.location.search).get('jwt');
