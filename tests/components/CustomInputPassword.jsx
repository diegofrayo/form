import React from 'react';

class CustomInputPassword extends React.Component {
  state = { error: '' };

  errorMessage = 'Custom input password error message';

  updateErrorMessage = isInputValid => {
    this.setState({ error: isInputValid ? '' : this.errorMessage });
  };

  onChange = event => {
    const {
      updaters: { setInputState, setInputValue },
      inputConfig,
    } = this.props;
    const { name, value } = event.currentTarget;
    const isValid = inputConfig.handlers.isValid(value);

    setInputValue(name, value);
    setInputState(name, isValid);
    this.updateErrorMessage(isValid);
  };

  render() {
    const { inputConfig, value } = this.props;
    const { error } = this.state;

    return (
      <section>
        <label htmlFor={inputConfig.htmlAttrs.id}>
          {`Password ${inputConfig.required ? '*' : ''}`}
          <input
            name="password"
            value={value}
            data-testid="input-password"
            onChange={this.onChange}
            {...inputConfig.htmlAttrs}
          />
        </label>
        <p>{error}</p>
      </section>
    );
  }
}

export default CustomInputPassword;
