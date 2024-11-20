import { token, url as baseUrl } from '../api';
import axios from 'axios';
import Cookies from 'js-cookie';
export const alphabetOnly = value => {
  const result = value.replace(/[^a-z]/gi, '');
  return result;
};
export class PermissionService {
  evaluateConditions() {}
}
export class EligibilityConditionsEvaluator extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
export class EnrollmentConditionsEvaluator extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
export class CommencementConditionsEvaluator extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
export class VisitConditionsEvaluator extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
export class DiscontinuationConditionsEvaluator extends PermissionService {
  evaluateConditions() {
    return false;
  }
}
