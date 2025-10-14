import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Field, Flex, IconButton, Typography } from '@strapi/design-system';
import { Eye, EyeStriked, Duplicate, Check } from '@strapi/icons';

const Input = ({
  attribute,
  description,
  disabled,
  error,
  intlLabel,
  labelAction,
  name,
  onChange,
  required,
  value,
}) => {
  const { formatMessage } = useIntl();
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  const charCount = value ? value.length : 0;

  return (
    <Field.Root
      name={name}
      id={name}
      error={error}
      hint={description && formatMessage(description)}
      required={required}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Field.Label action={labelAction}>
          {formatMessage(intlLabel)} 🔒
        </Field.Label>
        <Flex gap={2}>
          <IconButton
            label={showValue ? 'Ocultar valor' : 'Mostrar valor'}
            icon={showValue ? <EyeStriked /> : <Eye />}
            onClick={() => setShowValue(!showValue)}
            variant="ghost"
            disabled={!value}
          />
          <IconButton
            label={copied ? 'Copiado' : 'Copiar valor'}
            icon={copied ? <Check /> : <Duplicate />}
            onClick={handleCopy}
            variant="ghost"
            disabled={!value}
          />
        </Flex>
      </Flex>
      <Field.Input
        type={showValue ? 'text' : 'password'}
        placeholder={formatMessage({
          id: 'encrypted-field.placeholder',
          defaultMessage: 'Ingresa el texto a cifrar...',
        })}
        value={value || ''}
        onChange={(e) => {
          onChange({
            target: { name, value: e.target.value, type: attribute.type },
          });
        }}
        disabled={disabled}
      />
      <Flex justifyContent="space-between" alignItems="center" paddingTop={1}>
        <Field.Hint />
        {charCount > 0 && (
          <Typography variant="pi" textColor="neutral600">
            {charCount} {charCount === 1 ? 'carácter' : 'caracteres'}
          </Typography>
        )}
      </Flex>
      <Field.Error />
    </Field.Root>
  );
};

export default Input;
