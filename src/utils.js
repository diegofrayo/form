import React from 'react';

export const componentDidMount = callback => {
  return React.useEffect(callback, []);
};

export const isFormValid = formInputsState => {
  return Object.values(formInputsState).filter(state => state === false).length === 0;
};

export const keyMirror = (object = {}) => {
  return (Array.isArray(object) ? object : Object.keys(object)).reduce((result, curr) => {
    // eslint-disable-next-line no-param-reassign
    result[curr] = curr;

    return result;
  }, {});
};
