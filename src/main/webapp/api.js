export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMyMDM2ODY1fQ.rMPO30yAskgyvPwqz_8_awF2BR6J0Wiogi0kASgeYHhDL84O8PrH-mrfW153Pi49CCTDisXhki9anPIDQ6MAng'
    : new URLSearchParams(window.location.search).get('jwt');
