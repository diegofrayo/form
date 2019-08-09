import React from 'react';
import PropTypes from 'prop-types';

import { FORM_STATUS, FORM_SUBMIT_RESPONSE_TYPES } from './constants';
import FormService from './service';
import useForm from './state';
import { componentDidMount } from './utils';

const Form = function Form({
  children,
  config: formConfig,
  enableLogging,
  initialStatus,
  initialValues,
  onSubmit: onSubmitHandler,
  submitResponseMessages,
  validateAtDidMount,
}) {
  const {
    isFormSubmittedByFirstTime,
    formErrors,
    formInputsState,
    formStatus,
    formValues,
    submitResponse,

    resetSubmitResponse,
    setErrorMessage,
    setFailureSubmitResponse,
    setSuccessSubmitResponse,
    setLoadingFormStatus,
    setFormSubmittedByFirstTime,
    setFormErrors,
    setFormInputsState,
    setFormValues,
    setFormStatus,
    setInputValue,
    setInputState,
  } = useForm(enableLogging);

  const formService = new FormService({
    props: {
      formConfig,
      onSubmitHandler,
      submitResponseMessages,
      validateAtDidMount,
    },
    state: {
      formErrors,
      formInputsState,
      formStatus,
      formValues,
      submitResponse,
      isFormSubmittedByFirstTime,
    },
    stateHandlers: {
      resetSubmitResponse,
      setErrorMessage,
      setFailureSubmitResponse,
      setSuccessSubmitResponse,
      setLoadingFormStatus,
      setFormSubmittedByFirstTime,
      setFormErrors,
      setFormInputsState,
      setFormValues,
      setInputValue,
      setInputState,
    },
  });

  componentDidMount(() => {
    formService.validateFormConfig(formConfig);

    const formInitialValues = formService.createFormInitialValues(
      initialValues,
      formConfig,
    );

    setFormValues(formInitialValues);

    if (validateAtDidMount) {
      const {
        formErrors: formErrorsResulting,
        formInputsState: formInputsStateResulting,
      } = formService.validateForm({
        formConfig,
        formErrors,
        formInputsState,
        formValues: formInitialValues,
      });

      setFormErrors(formErrorsResulting);
      setFormInputsState(formInputsStateResulting);
    } else {
      const formInputsStateResulting = formService.getFormInputsState(formConfig);
      setFormInputsState(formInputsStateResulting);
    }

    if (initialStatus) {
      setFormStatus(initialStatus);
    }
  });

  if (!formValues) return null;

  return (
    <form>
      {children({
        errors: formErrors,
        formInputsState,
        onInputChange: formService.onInputChange,
        onSubmit: formService.onSubmit,
        resetSubmitResponse,
        status: formStatus,
        submitResponse,
        validateAtDidMount,
        values: formValues,
        updaters: {
          setInputState,
          setInputValue,
        },
      })}
    </form>
  );
};

Form.propTypes = {
  // See docs: https://diegofrayo-docs.netlify.com/form#config
  children: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,

  enableLogging: PropTypes.bool,
  initialStatus: PropTypes.oneOf([...Object.keys(FORM_STATUS), '']),
  initialValues: PropTypes.object,
  submitResponseMessages: PropTypes.shape({
    success: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    failure: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  }),
  validateAtDidMount: PropTypes.bool,
};

Form.defaultProps = {
  enableLogging: false,
  initialStatus: '',
  initialValues: {},
  submitResponseMessages: {},
  validateAtDidMount: false,
};

Form.STATUS = FORM_STATUS;

Form.SUBMIT_RESPONSE_TYPES = FORM_SUBMIT_RESPONSE_TYPES;

export default Form;
