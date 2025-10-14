import React from 'react';
import { useIntl } from 'react-intl';
import { Field } from '@strapi/design-system';

const Input = (props) => {
  const {
    attribute,
    description,
    disabled,
    error,
    intlLabel,
    labelAction,
    name,
    onChange,
    required,
    value = '',
  } = props;

  const { formatMessage } = useIntl();

  const handleChange = (e) => {
    onChange({
      target: {
        name,
        value: e.target.value,
        type: attribute?.type || 'string',
      },
    });
  };

  // Extraer solo el nombre del campo sin prefijos
  const fieldName = name.includes('.') ? name.split('.').pop() : name;
  const label = intlLabel?.id ? formatMessage(intlLabel) : (intlLabel || fieldName);

  return (
    <Field.Root
      name={name}
      id={name}
      error={error}
      hint={description?.id ? formatMessage(description) : description}
      required={required}
    >
      <Field.Label action={labelAction}>
        {label}
      </Field.Label>
      <Field.Input
        type="text"
        placeholder={formatMessage({
          id: 'encrypted-field.placeholder',
          defaultMessage: 'Ingresa el texto a cifrar...',
        })}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default Input;
