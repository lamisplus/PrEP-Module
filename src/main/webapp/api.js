export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM3OTUyMDcwfQ.VkzBYTjUfs6g07ssaDhc2Vq5N6boMiag8ndk_EY1MJskAr9wNn8uVgjFIc61BxYw49GlRiwhsCBoyo3pIQdWGA'
    : new URLSearchParams(window.location.search).get('jwt');
