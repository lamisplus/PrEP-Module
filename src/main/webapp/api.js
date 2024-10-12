export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI4NzQzODcxfQ.TdR0_Bk5Qqr9fzd4ntQf4R1aTzIDcKD2Jnl3xstvLC0lhLDc87uByrkSfV7mgQF-BB-9KKX1Y2TOuQ31cBuwIg'
    : new URLSearchParams(window.location.search).get('jwt');
