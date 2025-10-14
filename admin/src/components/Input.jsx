import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Field, IconButton } from '@strapi/design-system';
import { useNotification } from '@strapi/strapi/admin';
import { Eye, EyeStriked, Duplicate } from '@strapi/icons';

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
    placeholder,
    required,
    value = '',
  } = props;

  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(false);

  const handleChange = (e) => {
    onChange({
      target: {
        name,
        value: e.target.value,
        type: attribute?.type || 'string',
      },
    });
  };

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        toggleNotification({
          type: 'success',
          message: 'Copiado al portapapeles',
        });
      } catch (err) {
        toggleNotification({
          type: 'danger',
          message: 'Error al copiar',
        });
      }
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

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
      <div style={{ position: 'relative' }}>
        <Field.Input
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          style={{ paddingRight: '80px' }}
        />
        <div style={{ 
          position: 'absolute', 
          right: '8px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '4px'
        }}>
          <IconButton
            onClick={toggleVisibility}
            label={isVisible ? 'Ocultar' : 'Mostrar'}
            disabled={disabled}
            variant="ghost"
          >
            {isVisible ? <EyeStriked /> : <Eye />}
          </IconButton>
          <IconButton
            onClick={handleCopy}
            label="Copiar"
            disabled={disabled || !value}
            variant="ghost"
          >
            <Duplicate />
          </IconButton>
        </div>
      </div>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default Input;
