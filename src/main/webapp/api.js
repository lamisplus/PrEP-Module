export const  token = (new URLSearchParams(window.location.search)).get("jwt")
export const url = '/api/v1/'
// export const url =  'http://localhost:9090/api/v1/';
// export const  token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNjgyMTgwMTU4fQ.mDhXvF-P96uEjAvtZkcuUT4cYmXaWda6E1L75EpLXSSaVWXqpfePc7jDjjTUJRhBQjZEwXwQLFgZiFPyeRwLNA'