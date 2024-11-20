export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMyMTQ0OTI4fQ.ms01RV0zmOjbhRfnC0TDS2kBlDxwAG_uppMUI4l6C1WvIrHlYWIaMTF8rdAHrQ8LLHkbVjG9Jo56Jw6XTrBs6g'
    : new URLSearchParams(window.location.search).get('jwt');
