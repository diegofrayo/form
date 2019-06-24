import { vlt } from '@diegofrayo/vlt';

export default {
  email: {
    type: 'string',
    required: true,
    errorMessage: 'Type a valid email',
    htmlAttrs: {
      id: 'input-email',
      placeholder: 'email@domain.co',
      type: 'email',
      required: '',
    },
    handlers: {
      isValid: value => {
        return vlt()
          .email()
          .validate(value);
      },
    },
  },
  password: {
    type: 'string',
    required: true,
    errorMessage: 'The password must have at least 5 characters',
    customValidation: false,
    htmlAttrs: {
      id: 'input-password',
      placeholder: '',
      type: 'password',
      autoComplete: 'password',
      required: '',
    },
    handlers: {
      isValid: value => {
        return vlt()
          .minLength(5)
          .validate(value);
      },
    },
  },
  bio: {
    type: 'string',
    required: false,
    errorMessage: 'The bio must have at least two characters or leave it empty',
    htmlAttrs: {
      id: 'input-bio',
      placeholder: 'Bio',
      type: 'text',
    },
    handlers: {
      isValid: value => {
        return vlt()
          .string()
          .minLength(2)
          .allowEmpty()
          .validate(value);
      },
    },
  },
  birthDate: {
    type: 'string',
    required: true,
    errorMessage: 'Select a birth date',
    htmlAttrs: {
      id: 'input-birth-date',
      placeholder: '',
      type: 'date',
      required: '',
    },
    handlers: {
      isValid: value => {
        return vlt()
          .date()
          .validate(value);
      },
      transformBeforeSubmit: value => {
        const date = value.split('-');
        return `${date[2]}/${date[1]}/${date[0]}`;
      },
    },
  },
  age: {
    type: 'number',
    required: true,
    defaultValue: 18,
    errorMessage: 'Type a valid age',
    htmlAttrs: {
      id: 'input-age',
      max: 80,
      min: 18,
      type: 'number',
      required: '',
    },
    handlers: {
      isValid: value => {
        return vlt()
          .number()
          .min(18)
          .max(80)
          .validate(value);
      },
      transformBeforeSave: value => {
        return Number(value);
      },
    },
  },
};
