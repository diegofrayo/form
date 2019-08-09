import { vlt, TypesValidator, ValidationError } from '@diegofrayo/vlt';

import { isFormValid } from './utils';

export default class FormService {
  constructor({ props, state, stateHandlers }) {
    this.props = props;
    this.state = state;
    this.stateHandlers = stateHandlers;
  }

  validateFormConfig = formConfig => {
    const customValidation = (inputConfig, opts) => handlers => {
      if (
        inputConfig.customValidation !== true &&
        (!TypesValidator.isObject(handlers) ||
          !TypesValidator.isFunction(handlers.isValid))
      ) {
        return {
          isValid: false,
          error: new ValidationError(
            'customValidation',
            'You must set isValid handler',
            handlers,
            `${opts.validatedPropertyName} => handlers`,
          ),
        };
      }

      return { isValid: true };
    };

    const formConfigValidation = vlt()
      .arrayOf(
        vlt.scheme({
          type: vlt()
            .string()
            .notAllowEmpty(),
          handlers: vlt().customValidation(customValidation),
        }),
      )
      .validate(Object.values(formConfig), {
        getErrors: true,
        validatedPropertyName: 'formConfig',
        objectKeyExtractor: (object, index) => Object.keys(formConfig)[index],
      });

    if (!formConfigValidation.isValid) {
      throw new Error(vlt.formatErrorMessage('formConfig', formConfigValidation.errors));
    }

    return true;
  };

  createFormInitialValues = (formInitialValues, formConfig) => {
    const formValues = {
      ...Object.entries(formConfig).reduce((result, [inputName, inputConfig]) => {
        if (inputConfig.defaultValue !== undefined) {
          // eslint-disable-next-line no-param-reassign
          result[inputName] = inputConfig.defaultValue;
        } else {
          // eslint-disable-next-line no-param-reassign
          result[inputName] = this._createInputInitialValue(inputConfig.type);
        }

        return result;
      }, {}),
      ...formInitialValues,
    };

    return formValues;
  };

  getFormInputsState = formConfig => {
    const { validateAtDidMount } = this.props;
    const formInputsState = {
      ...Object.entries(formConfig).reduce((result, [inputName, inputConfig]) => {
        // eslint-disable-next-line no-param-reassign
        result[inputName] = inputConfig.customValidation ? false : !validateAtDidMount;

        return result;
      }, {}),
    };

    return formInputsState;
  };

  validateForm = ({ formConfig, formValues, formErrors, formInputsState }) => {
    return Object.entries(formConfig).reduce(
      (result, [inputName, inputConfig]) => {
        if (inputConfig.customValidation) return result;

        const isValidInput = this._validateInput({
          formConfig,
          formInputsState,
          formValues,
          inputConfig,
          inputName,
          inputValue: formValues[inputName],
        });

        if (TypesValidator.isBoolean(isValidInput)) {
          if (isValidInput) {
            // eslint-disable-next-line no-param-reassign
            result.formErrors[inputName] = '';

            // eslint-disable-next-line no-param-reassign
            result.formInputsState[inputName] = true;
          } else {
            // eslint-disable-next-line no-param-reassign
            result.formErrors[inputName] = inputConfig.errorMessage;

            // eslint-disable-next-line no-param-reassign
            result.formInputsState[inputName] = false;
          }
        } else if (TypesValidator.isString(isValidInput)) {
          // eslint-disable-next-line no-param-reassign
          result.formErrors[inputName] = isValidInput;

          // eslint-disable-next-line no-param-reassign
          result.formInputsState[inputName] = false;
        } else if (TypesValidator.isObject(isValidInput)) {
          Object.entries(isValidInput).forEach(([errorInputName, errorInputMessage]) => {
            // eslint-disable-next-line no-param-reassign
            result.formErrors[errorInputName] = errorInputMessage;

            // eslint-disable-next-line no-param-reassign, no-unneeded-ternary
            result.formInputsState[inputName] = errorInputMessage ? false : true;
          });
        } else {
          throw new Error(`${inputName} 'isValid' handler returns an invalid value`);
        }

        return result;
      },
      { formErrors: { ...formErrors }, formInputsState: { ...formInputsState } },
    );
  };

  onSubmit = event => {
    event.preventDefault();

    const {
      formConfig,
      onSubmitHandler,
      submitResponseMessages,
      validateAtDidMount,
    } = this.props;
    const {
      formErrors,
      formInputsState,
      formValues,
      isFormSubmittedByFirstTime,
    } = this.state;
    const {
      setFormSubmittedByFirstTime,
      setFormErrors,
      setFormInputsState,
      setLoadingFormStatus,
      setFailureSubmitResponse,
      setSuccessSubmitResponse,
    } = this.stateHandlers;

    if (!validateAtDidMount && isFormSubmittedByFirstTime) {
      const {
        formErrors: formErrorsResulting,
        formInputsState: formInputsStateResulting,
      } = this.validateForm({
        formConfig,
        formErrors,
        formValues,
        formInputsState,
      });

      setFormSubmittedByFirstTime(false);
      setFormInputsState(formInputsStateResulting);
      setFormErrors(formErrorsResulting);

      if (!isFormValid(formInputsStateResulting)) {
        return;
      }
    }

    const transformedValues = Object.entries(formConfig).reduce(
      (result, [inputName, inputConfig]) => {
        // eslint-disable-next-line no-param-reassign
        result[inputName] = this._executeInputHandler({
          formConfig,
          inputConfig,
          inputName,
          inputValue: formValues[inputName],
          handlerName: 'transformBeforeSubmit',
        });

        return result;
      },
      {},
    );

    setFormSubmittedByFirstTime(false);
    const onSubmitHandlerResult = onSubmitHandler(transformedValues);

    if (TypesValidator.isPromise(onSubmitHandlerResult)) {
      setLoadingFormStatus();

      onSubmitHandlerResult
        .then(res => {
          setSuccessSubmitResponse(
            this._getSubmitResponseMessage(submitResponseMessages.success, res),
          );
        })
        .catch(e => {
          setFailureSubmitResponse(
            this._getSubmitResponseMessage(submitResponseMessages.failure, e),
          );
        });
    }
  };

  onInputChange = data => {
    const { name: inputName, value: inputValue } = data.currentTarget
      ? data.currentTarget
      : data;

    const { formConfig } = this.props;
    const { formInputsState, formValues } = this.state;
    const { setErrorMessage, setInputValue } = this.stateHandlers;

    const inputConfig = formConfig[inputName];
    const transformedValue = this._executeInputHandler({
      formConfig,
      inputConfig,
      inputName,
      inputValue,
      handlerName: 'transformBeforeSave',
    });

    setInputValue(inputName, transformedValue);

    const isValidInput = this._validateInput({
      formConfig,
      formInputsState,
      formValues,
      inputConfig,
      inputName,
      inputValue: transformedValue,
    });

    if (TypesValidator.isBoolean(isValidInput)) {
      setErrorMessage(inputName, isValidInput ? null : inputConfig.errorMessage);
    } else if (TypesValidator.isString(isValidInput)) {
      setErrorMessage(inputName, isValidInput);
    } else if (TypesValidator.isObject(isValidInput)) {
      Object.entries(isValidInput).forEach(([errorInputName, errorInputMessage]) => {
        setErrorMessage(errorInputName, errorInputMessage);
      });
    } else {
      throw new Error(`${inputName} 'isValid' handler returns an invalid value`);
    }
  };

  setErrorMessage = ({ inputConfig, inputName, errorMessage }) => {
    const { setErrorMessage } = this.stateHandlers;

    if (
      vlt
        .isString()
        .notAllowEmpty()
        .validate(errorMessage)
    ) {
      this._addErrorMessage({
        errorMessage,
        inputName,
        inputConfig,
        setErrorMessage,
      });
    } else {
      setErrorMessage(inputName);
    }
  };

  _validateInput = ({
    formConfig,
    formInputsState,
    formValues,
    inputConfig,
    inputName,
    inputValue,
  }) => {
    const isValidInput = this._executeInputHandler({
      formConfig,
      formValues,
      inputConfig,
      inputValue,
      isInputValid: formInputsState[inputName],
      handlerName: 'isValid',
    });

    return isValidInput;
  };

  _addErrorMessage = ({ errorMessage, inputName, inputConfig, setErrorMessage }) => {
    let finalErrorMessage;

    if (errorMessage === null) {
      finalErrorMessage = '';
    } else if (typeof errorMessage === 'string') {
      finalErrorMessage = errorMessage;
    } else {
      finalErrorMessage = inputConfig.errorMessage;
    }

    setErrorMessage(inputName, finalErrorMessage);
  };

  _executeInputHandler = ({
    formConfig,
    formValues,
    handlerName,
    inputConfig,
    inputValue,
    isInputValid,
  }) => {
    // try to execute the handler if it exists
    if (inputConfig.handlers && typeof inputConfig.handlers[handlerName] === 'function') {
      return inputConfig.handlers[handlerName](inputValue, formValues, formConfig);
    }

    // if input has its own custom validation
    if (handlerName === 'isValid') {
      return isInputValid;
    }

    // if the handler required is not defined
    return inputValue;
  };

  _createInputInitialValue = type => {
    if (type === 'number') {
      return 1;
    }

    if (type === 'bool') {
      return false;
    }

    return '';
  };

  _getSubmitResponseMessage = (submitResponseMessage, data) => {
    if (typeof submitResponseMessage === 'function') {
      return submitResponseMessage(data);
    }

    return submitResponseMessage;
  };
}
