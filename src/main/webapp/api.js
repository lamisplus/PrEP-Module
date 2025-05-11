export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ2OTg2NjQ5fQ.0H6WJhi-xGk_KD7nGsal4CGiEwsh6BomQnLz-lNryDe_h9yp81KkuVFfiZ7c7B94JuMUVt-yVTxcIaEsT-_MUg'
    : new URLSearchParams(window.location.search).get('jwt');
