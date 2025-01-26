import { makeStyles } from '@material-ui/core/styles';

const useStyleForVisitForm = () => {
  const useStyles = makeStyles(theme => ({
    card: {
      margin: theme.spacing(20),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    cardBottom: {
      marginBottom: 20,
    },
    Select: {
      height: 45,
      width: 350,
    },
    button: {
      margin: theme.spacing(1),
    },
    root: {
      flexGrow: 1,
      '& .card-title': {
        color: '#fff',
        fontWeight: 'bold',
      },
      '& .form-control': {
        borderRadius: '0.25rem',
        height: '41px',
      },
      '& .card-header:first-child': {
        borderRadius: 'calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0',
      },
      '& .dropdown-toggle::after': {
        display: ' block !important',
      },
      '& select': {
        '-webkit-appearance': 'listbox !important',
      },
      '& p': {
        color: 'red',
      },
      '& label': {
        fontSize: '14px',
        color: '#014d88',
        fontWeight: 'bold',
      },
    },
    input: {
      display: 'none',
    },
    error: {
      color: '#f85032',
      fontSize: '11px',
    },
    success: {
      color: '#4BB543',
      fontSize: '11px',
    },
  }));

  return useStyles();
};

export default useStyleForVisitForm;
