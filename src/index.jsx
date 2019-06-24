import React from 'react';
import PropTypes from 'prop-types';

import { FORM_STATUS, FORM_SUBMIT_RESPONSE_TYPES } from './constants';
import FormService from './service';
import useForm from './state';
import { componentDidMount } from './utils';

const Form = function Form({
  children,
  config: formConfig,
  initialValues,
  onInputChangeParentHandler,
  onSubmit: onSubmitHandler,
  submitResponseMessages,
  validateAtDidMount,
}) {
  const {
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
    setFormErrors,
    setFormInputsState,
    setFormValues,
    setInputValue,
    setInputState,
  } = useForm();

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
    },
    stateHandlers: {
      resetSubmitResponse,
      setErrorMessage,
      setFailureSubmitResponse,
      setSuccessSubmitResponse,
      setLoadingFormStatus,
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
  });

  React.useEffect(() => {
    if (onInputChangeParentHandler) {
      onInputChangeParentHandler({ formErrors, formStatus, formValues });
    }
  }, [formValues]);

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
  // See docs: https://diegofrayo-docs.netlify.com
  config: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,

  initialValues: PropTypes.object,
  onInputChangeParentHandler: PropTypes.func,
  submitResponseMessages: PropTypes.shape({
    success: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    failure: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  }),
  validateAtDidMount: PropTypes.bool,
};

Form.defaultProps = {
  initialValues: {},
  onInputChangeParentHandler: undefined,
  submitResponseMessages: {},
  validateAtDidMount: false,
};

Form.STATUS = FORM_STATUS;

Form.SUBMIT_RESPONSE_TYPES = FORM_SUBMIT_RESPONSE_TYPES;

export default Form;
