import React, { createContext, useContext, useState, useEffect } from 'react';
import { token, url as baseUrl } from '../../api';
import axios from 'axios';
import Cookies from 'js-cookie';
import { prepForms } from '../../Utils/forms';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('guest');
  const [userPermissions, setUserPermissions] = useState([]);
  const [accessibleForms, setAccessibleForms] = useState([]);
  const [forms, setForms] = useState([]);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await axios.get(`${baseUrl}account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Cookies.set('facilityName', response.data.currentOrganisationUnitName);
        setUserPermissions(response?.data?.permissions);
      } catch (e) {
        console.error(e);
      }
    };

    fetchAccount();
    setForms(prepForms);
  }, []);

  //   useEffect(() => {
  //     const roles = {
  //       admin: ['all'],
  //       user: ['basic', 'pre-test-counsel'],
  //       guest: ['basic'],
  //     };

  //     const getUserPermissions = role => {
  //       return roles[role] || [];
  //     };

  //     setUserPermissions(getUserPermissions(userRole));
  //   }, [userRole]);

  const hasPermission = form => {
    for (let i = 0; i < userPermissions.length; i++) {
      if (userPermissions[i].toLowerCase().includes('all')) return true;
    }
    return userPermissions.includes(form.code);
  };

  useEffect(() => {
    const accessibleForms = forms.filter(
      form => hasPermission(form) && !form.evaluateConditions()
    );

    setAccessibleForms(accessibleForms);
  }, [userPermissions]);

  return (
    <AuthContext.Provider value={{ hasPermission, accessibleForms }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
