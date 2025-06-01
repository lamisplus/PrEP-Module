export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ4NjMzODUyfQ.VFdRxsSDi5dl_NBNvSQaiSkOS2-ovIVqWNTDmHMdyaRAsESkVKc2izHc3dVi0YCF6N_JbS7MTtSOKo-XbwMpeQ'
    : new URLSearchParams(window.location.search).get('jwt');
