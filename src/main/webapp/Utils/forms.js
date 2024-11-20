import {
  CommencementConditionsEvaluator,
  DiscontinuationConditionsEvaluator,
  EligibilityConditionsEvaluator,
  EnrollmentConditionsEvaluator,
  VisitConditionsEvaluator,
} from './permissions';

export const prepForms = [
  {
    name: 'PrEP_Eligibility',
    code: 'eligibility',
    general: true,
    evaluateConditions: new EligibilityConditionsEvaluator().evaluateConditions,
  },
  {
    name: 'PrEP_Enrollment',
    code: 'enrollment',
    general: true,
    evaluateConditions: new EnrollmentConditionsEvaluator().evaluateConditions,
  },
  {
    name: 'PrEP_Commencement',
    code: 'commencement',
    general: true,
    evaluateConditions: new CommencementConditionsEvaluator()
      .evaluateConditions,
  },
  {
    name: 'PrEP_Visit',
    code: 'visit',
    general: true,
    evaluateConditions: new VisitConditionsEvaluator().evaluateConditions,
  },
  {
    name: 'PrEP_Discontinuation',
    code: 'discontinuation',
    general: true,
    evaluateConditions: new DiscontinuationConditionsEvaluator()
      .evaluateConditions,
  },
];
