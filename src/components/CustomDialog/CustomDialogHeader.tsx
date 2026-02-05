import CloseIcon from '@mui/icons-material/Close';
import { DialogTitle } from '@mui/material';
import React from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import RippleButton from '../RippleButton';

type CustomDialogHeaderProps = {
  title: React.ReactNode;
  onClose: () => void;
  showManimizeMaximize?: boolean;
  showRequiredLabel?: boolean;
  isMinimized?: boolean;
  onMinimizeMaximize?: () => void;
  style?: object;
  additionalTitle?: React.ReactNode;
};

function CustomDialogHeader({
  title,
  onClose,
  showManimizeMaximize = false,
  showRequiredLabel = true,
  isMinimized = true,
  onMinimizeMaximize = () => { },
  style = {},
  additionalTitle = null
}: CustomDialogHeaderProps) {
  const maxWidth = React.useMemo(() => {
    let tempWidth = 0;
    const onCloseButtonWidth = 30;
    const showManimizeMaximizeWidth = 32;
    const showRequiredLabelWidth = 121;
    if (onClose) {
      tempWidth += onCloseButtonWidth;
    }
    if (showManimizeMaximize) {
      tempWidth += showManimizeMaximizeWidth;
    }
    if (showRequiredLabel) {
      tempWidth += showRequiredLabelWidth;
    }
    return tempWidth;
  }, [showRequiredLabel, showManimizeMaximize, onClose, title, additionalTitle]);

  return (
    <DialogTitle component={'div'} className={`relative isolate flex min-h-[60px]  items-center justify-between px-4 py-2`}>
      <div className="absolute left-0 right-0 top-0 z-[-1] h-[calc(100%+10px)] bg-gradient-to-b from-theme/30 to-transparent [--tw-gradient-from-position:0%] [--tw-gradient-to-position:100%]" />
      <h2
        className={` title-layout flex min-w-0 items-center gap-1 text-ellipsis text-xl font-semibold leading-[1.6]`}
        style={{ ...style, maxWidth: `calc(100% - ${maxWidth}px)` }}
      >
        <span className="truncate">{title}</span>
        {additionalTitle && <span className="truncate">{additionalTitle}</span>}
      </h2>
      <div className={`close flex min-w-max shrink-0 gap-2`}>
        {showRequiredLabel && <span className="form-label-style mr-2 !text-[--primary-text]">* Required Fields</span>}
        {showManimizeMaximize && !(isMobile || isTablet) && (
          <RippleButton
            aria-label="close"
            onClick={onMinimizeMaximize}
            className="flex !size-[32px] items-center justify-center rounded-md bg-[white] p-1 shadow-md hover:bg-gray-100 dark:bg-[--dark-primary] dark:shadow-[0_4px_6px_-1px_rgb(255,255,255,0.1),0_2px_4px_-2px_rgba(255,255,255,0.1)] dark:hover:bg-neutral-800"
          >
            {isMinimized ? <FiMaximize2 size={18} /> : <FiMinimize2 size={18} />}
          </RippleButton>
        )}
        {onClose && (
          <RippleButton
            aria-label="close"
            onClick={onClose}
            className="flex !size-[32px] items-center justify-center rounded-md bg-[white] p-1 shadow-md hover:bg-gray-100 dark:bg-[--dark-primary] dark:shadow-[0_4px_6px_-1px_rgb(255,255,255,0.1),0_2px_4px_-2px_rgba(255,255,255,0.1)] dark:hover:bg-neutral-800"
          >
            <CloseIcon className="close-button " />
          </RippleButton>
        )}
      </div>
    </DialogTitle>
  );
}

export default CustomDialogHeader;
