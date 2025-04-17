export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ0OTEzNjY3fQ.bEHnW78rJ3WfK5XWmx_5StX5nvzqo35FnFyZofrSwkDUskYeFHnisfRBJvy5V_Y0OEKFHyKaLtAja_5O_4DqDg'
    : new URLSearchParams(window.location.search).get('jwt');
