import { forwardRef } from 'react';
import { Button, type ButtonProps } from '../Button';

export interface IconButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon'> {
  /** Required — icon-only buttons have no visible text label. */
  'aria-label': string;
}

/** Square, icon-only `Button`. `children` is the icon. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'icon', ...props }, ref) => <Button ref={ref} size={size} {...props} />,
);
IconButton.displayName = 'IconButton';
