import logger from 'redux-logger';
import { duck, useEnhancedReducer } from '@diegofrayo/redux-utils';

import { FORM_STATUS, FORM_SUBMIT_RESPONSE_TYPES } from './constants';
import { isFormValid } from './utils';

const formDuck = duck.create('form');

// --- ACTION TYPES ---
const ActionTypes = formDuck.defineTypes([
  'RESET_SUBMIT_RESPONSE',
  'SET_FAILURE_SUBMIT_RESPONSE',
  'SET_SUCCESS_SUBMIT_RESPONSE',
  'SET_LOADING_FORM_STATUS',
  'SET_FORM_SUBMITTED_BY_FIRST_TIME',
  'SET_FORM_ERRORS',
  'SET_FORM_INPUTS_STATE',
  'SET_FORM_VALUES',
  'SET_FORM_STATUS',
  'SET_ERROR_MESSAGE',
  'SET_INPUT_STATE',
  'SET_INPUT_VALUE',
]);

// --- INITIAL STATE ---
const initialState = {
  isFormSubmittedByFirstTime: true,
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

// --- REDUCER HANDLERS ---
const reducerHandlers = {
  [ActionTypes.RESET_SUBMIT_RESPONSE]: state => {
    return { ...state, submitResponse: initialState.submitResponse };
  },

  [ActionTypes.SET_FAILURE_SUBMIT_RESPONSE]: (state, action) => {
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

  [ActionTypes.SET_SUCCESS_SUBMIT_RESPONSE]: (state, action) => {
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

  [ActionTypes.SET_LOADING_FORM_STATUS]: state => {
    return {
      ...state,
      formStatus: FORM_STATUS.LOADING,
      submitResponse: { ...initialState.submitResponse },
    };
  },

  [ActionTypes.SET_FORM_INPUTS_STATE]: (state, action) => {
    return {
      ...state,
      formInputsState: action.payload,
      formStatus: isFormValid(action.payload) ? FORM_STATUS.VALID : FORM_STATUS.INVALID,
    };
  },

  [ActionTypes.SET_ERROR_MESSAGE]: (state, action) => {
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

  [ActionTypes.SET_INPUT_STATE]: (state, action) => {
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

  [ActionTypes.SET_INPUT_VALUE]: (state, action) => {
    return {
      ...state,
      formValues: {
        ...state.formValues,
        [action.payload.inputName]: action.payload.inputValue,
      },
    };
  },

  ...duck.mergeActions({
    types: [
      ActionTypes.SET_FORM_ERRORS,
      ActionTypes.SET_FORM_STATUS,
      ActionTypes.SET_FORM_SUBMITTED_BY_FIRST_TIME,
      ActionTypes.SET_FORM_VALUES,
    ],
    handler: (state, action) => {
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

// --- REDUCER ---
const reducer = formDuck.createReducer(reducerHandlers, initialState);

// --- HOOK ---
const useForm = enableLogging => {
  const [state, dispatch] = useEnhancedReducer(
    reducer,
    initialState,
    enableLogging ? [logger] : undefined,
  );

  const resetSubmitResponse = () => {
    dispatch({ type: ActionTypes.RESET_SUBMIT_RESPONSE });
  };

  const setFailureSubmitResponse = message => {
    dispatch({ type: ActionTypes.SET_FAILURE_SUBMIT_RESPONSE, payload: message });
  };

  const setSuccessSubmitResponse = message => {
    dispatch({ type: ActionTypes.SET_SUCCESS_SUBMIT_RESPONSE, payload: message });
  };

  const setLoadingFormStatus = () => {
    dispatch({ type: ActionTypes.SET_LOADING_FORM_STATUS });
  };

  const setFormSubmittedByFirstTime = isFormSubmittedByFirstTime => {
    dispatch({
      type: ActionTypes.SET_FORM_SUBMITTED_BY_FIRST_TIME,
      payload: { isFormSubmittedByFirstTime },
    });
  };

  const setFormErrors = formErrors => {
    dispatch({
      type: ActionTypes.SET_FORM_ERRORS,
      payload: { formErrors },
    });
  };

  const setFormInputsState = formInputsState => {
    dispatch({
      type: ActionTypes.SET_FORM_INPUTS_STATE,
      payload: formInputsState,
    });
  };

  const setFormValues = formValues => {
    dispatch({
      type: ActionTypes.SET_FORM_VALUES,
      payload: { formValues },
    });
  };

  const setFormStatus = formStatus => {
    dispatch({
      type: ActionTypes.SET_FORM_STATUS,
      payload: { formStatus },
    });
  };

  const setErrorMessage = (inputName, errorMessage) => {
    dispatch({
      type: ActionTypes.SET_ERROR_MESSAGE,
      payload: { inputName, errorMessage },
    });
  };

  const setInputState = (inputName, inputState) => {
    dispatch({ type: ActionTypes.SET_INPUT_STATE, payload: { inputName, inputState } });
  };

  const setInputValue = (inputName, inputValue) => {
    dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: { inputName, inputValue } });
  };

  return {
    ...state,

    resetSubmitResponse,
    setFailureSubmitResponse,
    setSuccessSubmitResponse,
    setLoadingFormStatus,
    setFormSubmittedByFirstTime,
    setFormStatus,
    setFormErrors,
    setFormInputsState,
    setFormValues,
    setErrorMessage,
    setInputState,
    setInputValue,
  };
};

export default useForm;
