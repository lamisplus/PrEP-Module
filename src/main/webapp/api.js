export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQzNjk2NzMzfQ.l5jmT8ctF6Kb6LRWjoo6mKiS1RA8eOQn_0CX1BE-VQIdiwm4SiwXSWBMhAnNuzspPsu1QBofUdwbGwLunvtfAQ'
    : new URLSearchParams(window.location.search).get('jwt');
