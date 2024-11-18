import { token, url as baseUrl } from '../api';
import axios from 'axios';
import Cookies from 'js-cookie';
export const alphabetOnly = value => {
  const result = value.replace(/[^a-z]/gi, '');
  return result;
};
export const getAcount = async () => {
  try {
    const response = await axios.get(`${baseUrl}account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Cookies.set('facilityName', response.data.currentOrganisationUnitName);

    return response.data;
  } catch (e) {}
};

const roles = {
  admin: ['all'],
  user: ['basic', 'pre-test-counsel'],
  guest: ['basic'],
};

const forms = [
  {
    name: 'PrEP_Eligibility',
    code: 'eligibility',
    general: true,
    conditions: Eligibility.evaluateConditions,
  },
  {
    name: 'PrEP_Enrollment',
    code: 'enrollment',
    general: true,
    conditions: Enrollment.evaluateConditions,
  },
  {
    name: 'PrEP_Commencement',
    code: 'commencement',
    general: true,
    conditions: Commencement.evaluateConditions,
  },
  {
    name: 'PrEP_Visit',
    code: 'visit',
    general: true,
    conditions: Visit.evaluateConditions,
  },
  {
    name: 'PrEP_Discontinuation',
    code: 'discontinuation',
    general: true,
    conditions: Discontinuation.evaluateConditions,
  },
];

class PermissionService {
  constructor(userRole) {
    this.userRole = userRole;
    this.userPermissions = this.getUserPermissions();
  }

  getUserPermissions() {
    return roles[this.userRole] || [];
  }

  hasPermission(form) {
    if (this.userPermissions.includes('all')) {
      return true;
    }
    return this.userPermissions.includes(form.code);
  }

  evaluateConditions() {
    return false;
  }

  getAccessibleForms() {
    return forms.filter(form => {
      return this.hasPermission(form) && form.evaluateConditions(form);
    });
  }
}
class Eligibility extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
class Enrollment extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
class Commencement extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
class Visit extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
class Discontinuation extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
const userRole = 'user';
const permissionService = new PermissionService(userRole);
const accessibleForms = permissionService.getAccessibleForms();

console.log(accessibleForms);
