export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
<<<<<<< Updated upstream
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUwMDk5NTc5fQ.dJp427XBcBGTWy3fI2mWzSne-d-4XlcAhmZGEpKX1Svq9JwFCvsYm6q0Vqi_l-TfypsX90Ej9S_QSIMIa-R19Q'
=======
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ3NjY5Nzg4fQ.jVVl78hiE_eQG-mVWPkfPfKIunQj1FrE0-BYzX1swUf4sW_mUAN2N6Pe7F-rhsqHt1H_ZCcE-nmamVLoMOtxhg'
>>>>>>> Stashed changes
    : new URLSearchParams(window.location.search).get('jwt');
