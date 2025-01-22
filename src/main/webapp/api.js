export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM3NTg1MDkyfQ.ej_19XKt52zX0palBlTMtHZkc2f_FcfT7QK0X27KuIQwJfsWIjwaG51O6UFsKWdvj_fo_0AjNrvamixuvp77qg'
    : new URLSearchParams(window.location.search).get('jwt');
