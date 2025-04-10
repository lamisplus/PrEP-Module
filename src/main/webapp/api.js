export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ0MzIwMDc0fQ._3iF9zdcYfs3OPvCJw0z-xlWvOzcbfTRJ___staYwB6dZ3UrLqqUZ-I35-_Gbb-7L0NrA8OsrsNilV6ZaNW8IQ'
    : new URLSearchParams(window.location.search).get('jwt');
