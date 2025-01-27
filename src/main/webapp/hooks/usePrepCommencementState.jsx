import React from 'react';
import { useFormik } from 'formik';
import { useValidation } from './useValidation';
import useInitialValuesForVisitForm from './useInitialValuesForVisitForm';
import useSubmitHandlerForVisitForm from './useOnSubmitHandlerForVisitForm';
import {
  useWhyPoorFairAdherence,
  useSyndromicStiScreening,
  usePrepStatus,
  usePrepSideEffects,
  useHts,
  usePrepRegimen,
  useTestGroup,
  usePrepUrinalysisResult,
  useCreatinineTestResultOptions,
  usePrepOtherTests,
  useSyphilisResult,
  useHepatitisScreeningResult,
  useFamilyPlanningMethod,
  usePregnancyStatus,
  usePrepEntryPoint,
  usePrepType,
  usePopulationType,
  useVisitType,
  useReasonForSwitch,
  usePrepRiskReductionPlan,
  useLiverFunctionTestResult,
  useRecentActivities,
} from './usePrepCodeSet';
import { useLatestFromEligibility } from './useApiUtilsForPrepVisit';

const usePrepCommencementState = props => {
  const [disabledField, setDisabledField] = React.useState(false);
  const { data: adherenceLevel, setData: setAdherenceLevel } =
    useWhyPoorFairAdherence();
  const { data: sti, setData: setSti } = useSyndromicStiScreening();
  const { data: prepStatus, setData: setPrepStatus } = usePrepStatus();
  const { data: prepSideEffect, setData: setPrepSideEffect } =
    usePrepSideEffects();
  const { data: htsResult, setData: setHtsResult } = useHts();
  const { data: prepRegimen, setData: setPrepRegimen } = usePrepRegimen();
  const { data: labTestOptions, setData: setLabTestOptions } = useTestGroup();
  const { data: urineTestResult, setData: setUrineTestResult } =
    usePrepUrinalysisResult();
  const { data: creatinineTestResult, setData: setCreatinineTestResult } =
    useCreatinineTestResultOptions();
  const { data: otherTestResult, setData: setOtherTestResult } =
    usePrepOtherTests();
  const { data: sphylisTestResult, setData: setSphylisTestResult } =
    useSyphilisResult();
  const { data: hepaTestResult, setData: setHepaTestResult } =
    useHepatitisScreeningResult();
  const { data: familyPlanningMethod, setData: setFamilyPlanningMethod } =
    useFamilyPlanningMethod();
  const { data: pregnant, setData: setPregnant } = usePregnancyStatus();
  const { data: prepEntryPoint, setData: setPrepEntryPoints } =
    usePrepEntryPoint();
  const { data: prepType, setData: setPrepType } = usePrepType();
  const { data: populationType, setData: setPopulationType } =
    usePopulationType();
  const { data: visitType, setData: setVisitType } = useVisitType();
  const { data: latestFromEligibility, setData: setLatestFromEligibility } =
    useLatestFromEligibility(props.patientObj?.personId);
  const { data: hivTestResult, setData: setHivTestResult } = useHivResult(
    props.patientObj?.personId
  );
  const { data: reasonForSwitchOptions, setData: setReasonForSwitchOptions } =
    useReasonForSwitch();
  const { data: prepRiskReductionPlan, setData: setPrepRiskReductionPlan } =
    usePrepRiskReductionPlan();
  const { data: recentActivities, setData: setRecentActivities } =
    useRecentActivities(props.patientObj?.personId);
  const { data: liverFunctionTestResult, setData: setLiverFunctionTestResult } =
    useLiverFunctionTestResult();
  const { validationSchema } = useValidation();
  const { initialValues } = useInitialValuesForVisitForm();
  const { onSubmit, saving } = useSubmitHandlerForVisitForm();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return {
    formik,
    disabledField,
    setDisabledField,
    adherenceLevel,
    setAdherenceLevel,
    sti,
    setSti,
    prepStatus,
    setPrepStatus,
    prepSideEffect,
    setPrepSideEffect,
    htsResult,
    setHtsResult,
    prepRegimen,
    setPrepRegimen,
    labTestOptions,
    setLabTestOptions,
    urineTestResult,
    setUrineTestResult,
    creatinineTestResult,
    setCreatinineTestResult,
    otherTestResult,
    setOtherTestResult,
    sphylisTestResult,
    setSphylisTestResult,
    hepaTestResult,
    setHepaTestResult,
    familyPlanningMethod,
    setFamilyPlanningMethod,
    pregnant,
    setPregnant,
    prepEntryPoint,
    setPrepEntryPoints,
    prepType,
    setPrepType,
    populationType,
    setPopulationType,
    visitType,
    setVisitType,
    latestFromEligibility,
    setLatestFromEligibility,
    hivTestResult,
    setHivTestResult,
    reasonForSwitchOptions,
    setReasonForSwitchOptions,
    prepRiskReductionPlan,
    setPrepRiskReductionPlan,
    recentActivities,
    setRecentActivities,
    liverFunctionTestResult,
    setLiverFunctionTestResult,
  };
};

export default usePrepCommencementState;
