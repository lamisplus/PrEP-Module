export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQwNDE1MDY0fQ.SKVeRaPWVuLD4kS2sEa2BZ_g_04TET7tDVu8rNWaSuvTyuY4cjYxS5KuYO2DbEi_i4Hki9x9MEEKypVvOGPrzA'
    : new URLSearchParams(window.location.search).get('jwt');
