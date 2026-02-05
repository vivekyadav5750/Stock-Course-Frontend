import MuiDialogActions from '@mui/material/DialogActions';
import type { DialogActionsProps } from '@mui/material/DialogActions';
import { cn } from '@/utils';

interface CustomDialogFooterProps extends DialogActionsProps {}

function CustomDialogFooter({ children, className = '', ...others }: CustomDialogFooterProps) {
  return (
    <MuiDialogActions
      className={cn(`overscroll-contain py-2`, className)}
      sx={{ margin: 0, padding: '12px 16px' }}
      {...others}
    >
      {children}
    </MuiDialogActions>
  );
}

export default CustomDialogFooter;
