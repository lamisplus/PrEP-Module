export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ0NzMyNDQyfQ.5NfLsW7VXAM-hFZPCgpv6OKhWRqzjmvvHY1x_rxcMGK4LE61chrG7rBwRuz8FnkUbtG6BE94GkkwuxYm4Yliow'
    : new URLSearchParams(window.location.search).get('jwt');
