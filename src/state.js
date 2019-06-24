import React from 'react';

import { FORM_STATUS, FORM_SUBMIT_RESPONSE_TYPES } from './constants';
import { keyMirror, isFormValid, mergeActions } from './utils';

const INITIAL_STATE = {
  formErrors: {},
  formStatus: FORM_STATUS.VALID,
  formValues: null,
  formInputsState: {},
  submitResponse: {
    type: FORM_SUBMIT_RESPONSE_TYPES.SUCCESS,
    message: '',
    show: false,
  },
};

const ACTIONS = keyMirror([
  'RESET_SUBMIT_RESPONSE',
  'SET_FAILURE_SUBMIT_RESPONSE',
  'SET_SUCCESS_SUBMIT_RESPONSE',
  'SET_LOADING_FORM_STATUS',
  'SET_FORM_ERRORS',
  'SET_FORM_INPUTS_STATE',
  'SET_FORM_VALUES',
  'SET_ERROR_MESSAGE',
  'SET_INPUT_STATE',
  'SET_INPUT_VALUE',
]);

const reducerActions = {
  [ACTIONS.RESET_SUBMIT_RESPONSE]: state => {
    return { ...state, submitResponse: INITIAL_STATE.submitResponse };
  },

  [ACTIONS.SET_FAILURE_SUBMIT_RESPONSE]: (state, action) => {
    return {
      ...state,
      formStatus: FORM_STATUS.VALID,
      submitResponse: {
        show: true,
        type: FORM_SUBMIT_RESPONSE_TYPES.FAILURE,
        message: action.payload,
      },
    };
  },

  [ACTIONS.SET_SUCCESS_SUBMIT_RESPONSE]: (state, action) => {
    return {
      ...state,
      formStatus: FORM_STATUS.VALID,
      submitResponse: {
        show: true,
        type: FORM_SUBMIT_RESPONSE_TYPES.SUCCESS,
        message: action.payload,
      },
    };
  },

  [ACTIONS.SET_LOADING_FORM_STATUS]: state => {
    return {
      ...state,
      formStatus: FORM_STATUS.LOADING,
      submitResponse: { ...INITIAL_STATE.submitResponse },
    };
  },

  [ACTIONS.SET_FORM_INPUTS_STATE]: (state, action) => {
    return {
      ...state,
      formInputsState: action.payload,
      formStatus: isFormValid(action.payload) ? FORM_STATUS.VALID : FORM_STATUS.INVALID,
    };
  },

  [ACTIONS.SET_ERROR_MESSAGE]: (state, action) => {
    const stateUpdates = ((formErrors, formInputsState) => {
      const formErrorsUpdated = { ...formErrors };
      const formInputsStateUpdated = { ...formInputsState };

      if (action.payload.errorMessage) {
        formErrorsUpdated[action.payload.inputName] = action.payload.errorMessage;
        formInputsStateUpdated[action.payload.inputName] = false;
      } else {
        formErrorsUpdated[action.payload.inputName] = '';
        formInputsStateUpdated[action.payload.inputName] = true;
      }

      return {
        formErrors: formErrorsUpdated,
        formInputsState: formInputsStateUpdated,
        formStatus: isFormValid(formInputsStateUpdated)
          ? FORM_STATUS.VALID
          : FORM_STATUS.INVALID,
      };
    })(state.formErrors, state.formInputsState);

    return {
      ...state,
      ...stateUpdates,
    };
  },

  [ACTIONS.SET_INPUT_STATE]: (state, action) => {
    const stateUpdates = ((formErrors, formInputsState, payload) => {
      const formInputsStateUpdated = {
        ...formInputsState,
        [payload.inputName]: payload.inputState,
      };

      return {
        formInputsState: formInputsStateUpdated,
        formStatus: isFormValid(formInputsStateUpdated)
          ? FORM_STATUS.VALID
          : FORM_STATUS.INVALID,
      };
    })(state.formStatus, state.formInputsState, action.payload);

    return {
      ...state,
      ...stateUpdates,
    };
  },

  [ACTIONS.SET_INPUT_VALUE]: (state, action) => {
    return {
      ...state,
      formValues: {
        ...state.formValues,
        [action.payload.inputName]: action.payload.inputValue,
      },
    };
  },

  ...mergeActions({
    actionTypes: [ACTIONS.SET_FORM_ERRORS, ACTIONS.SET_FORM_VALUES],
    reducer: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  }),

  default: (state, action) => {
    throw new Error(`Invalid action: ${action.type}`);
  },
};

const reducer = (state, action) => {
  const reducerAction = reducerActions[action.type] || reducerActions.default;
  // console.group('ACTION', action.type);
  const newState = reducerAction(state, action);
  // console.log('NEW STATE', newState);
  // console.groupEnd(newState);
  return newState;
};

const useForm = () => {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE);

  const resetSubmitResponse = () => {
    dispatch({ type: ACTIONS.RESET_SUBMIT_RESPONSE });
  };

  const setFailureSubmitResponse = message => {
    dispatch({ type: ACTIONS.SET_FAILURE_SUBMIT_RESPONSE, payload: message });
  };

  const setSuccessSubmitResponse = message => {
    dispatch({ type: ACTIONS.SET_SUCCESS_SUBMIT_RESPONSE, payload: message });
  };

  const setLoadingFormStatus = () => {
    dispatch({ type: ACTIONS.SET_LOADING_FORM_STATUS });
  };

  const setFormErrors = formErrors => {
    dispatch({
      type: ACTIONS.SET_FORM_ERRORS,
      payload: { formErrors },
    });
  };

  const setFormInputsState = formInputsState => {
    dispatch({
      type: ACTIONS.SET_FORM_INPUTS_STATE,
      payload: formInputsState,
    });
  };

  const setFormValues = formValues => {
    dispatch({
      type: ACTIONS.SET_FORM_VALUES,
      payload: { formValues },
    });
  };

  const setErrorMessage = (inputName, errorMessage) => {
    dispatch({
      type: ACTIONS.SET_ERROR_MESSAGE,
      payload: { inputName, errorMessage },
    });
  };

  const setInputState = (inputName, inputState) => {
    dispatch({ type: ACTIONS.SET_INPUT_STATE, payload: { inputName, inputState } });
  };

  const setInputValue = (inputName, inputValue) => {
    dispatch({ type: ACTIONS.SET_INPUT_VALUE, payload: { inputName, inputValue } });
  };

  return {
    ...state,

    resetSubmitResponse,
    setFailureSubmitResponse,
    setSuccessSubmitResponse,
    setLoadingFormStatus,
    setFormErrors,
    setFormInputsState,
    setFormValues,
    setErrorMessage,
    setInputState,
    setInputValue,
  };
};

export default useForm;
