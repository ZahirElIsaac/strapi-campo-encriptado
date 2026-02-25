import { type ChangeEvent, type ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { Field, IconButton } from '@strapi/design-system';
import { useNotification } from '@strapi/strapi/admin';
import { Eye, EyeStriked, Duplicate } from '@strapi/icons';

type MessageDescriptorLike = {
  id?: string;
  defaultMessage?: string;
  values?: Record<string, unknown>;
};

type NotificationType = 'success' | 'danger' | 'warning' | 'info';

interface NotificationApi {
  toggleNotification: (payload: {
    type: NotificationType;
    message: string;
  }) => void;
}

interface InputProps {
  attribute?: {
    type?: string;
  };
  description?: string | MessageDescriptorLike;
  disabled?: boolean;
  error?: string;
  intlLabel?: string | MessageDescriptorLike;
  labelAction?: ReactNode;
  name: string;
  onChange: (event: {
    target: {
      name: string;
      value: string;
      type: string;
    };
  }) => void;
  placeholder?: string;
  required?: boolean;
  value?: string | null;
}

const Input = (props: InputProps) => {
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
  const { toggleNotification } = useNotification() as NotificationApi;
  const [isVisible, setIsVisible] = useState(false);
  const safeValue = typeof value === 'string' ? value : '';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: {
        name,
        value: e.target.value,
        type: attribute?.type || 'string',
      },
    });
  };

  const handleCopy = async () => {
    if (safeValue) {
      try {
        await navigator.clipboard.writeText(safeValue);
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
  const label =
    typeof intlLabel === 'object'
      ? intlLabel?.id
        ? formatMessage(intlLabel)
        : intlLabel?.defaultMessage || fieldName
      : intlLabel || fieldName;
  const hint =
    typeof description === 'object'
      ? description?.id
        ? formatMessage(description)
        : description?.defaultMessage
      : description;

  return (
    <Field.Root
      name={name}
      id={name}
      error={error}
      hint={hint}
      required={required}
    >
      <Field.Label action={labelAction}>
        {label}
      </Field.Label>
      <div style={{ position: 'relative' }}>
        <Field.Input
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          value={safeValue}
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
            disabled={disabled || !safeValue}
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
