import * as React from 'react';

import { cn } from '@/lib/shared/services/utils';

interface RadioGroupContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  value: undefined,
  onValueChange: () => undefined,
  disabled: false,
});

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, defaultValue, onValueChange, disabled, children, className, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const currentValue = isControlled ? value : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(nextValue);
        }
        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange],
    );

    return (
      <RadioGroupContext.Provider
        value={{ value: currentValue, onValueChange: handleValueChange, disabled }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn('grid gap-2', className)}
          aria-disabled={disabled}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';

interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value: string;
  label?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, label, className, disabled, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = context.value === value;
    const isDisabled = context.disabled || disabled;

    const handleChange = React.useCallback(() => {
      if (!isDisabled) {
        context.onValueChange(value);
      }
    }, [context, isDisabled, value]);

    return (
      <label
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer select-none',
          isDisabled && 'cursor-not-allowed opacity-60',
          className,
        )}
      >
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border border-medical-gray transition',
            isChecked && 'border-progress-teal',
            !isDisabled && 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-progress-teal',
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full bg-progress-teal transition-opacity',
              isChecked ? 'opacity-100' : 'opacity-0',
            )}
          />
        </span>
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <span>{children ?? label}</span>
      </label>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
