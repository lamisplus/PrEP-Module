export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM2MzM5NDMyfQ.ASz6-jlbPhDutd0fFfpmoSepZ6T00EqTxivzZWATAMrMcMlCm5pdNIVtn7sIgl2G_pRDrp51O7jtOrZhfmOxOQ'
    : new URLSearchParams(window.location.search).get('jwt');
