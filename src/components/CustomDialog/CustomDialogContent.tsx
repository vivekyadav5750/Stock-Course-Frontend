import { DialogContentProps, DialogContent as MuiDialogContent } from '@mui/material';
import React, { CSSProperties, useEffect, useState } from 'react';
import { isMobile, isTablet, isIOS } from 'react-device-detect';
import { cn } from '@/utils';

const useViewportDynamicHeight = (enable = false) => {
  const [height, setHeight] = useState<number>(null);
  useEffect(() => {
    if (!enable) return;
    let timeout = null;
    const setHeightFunc = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      requestAnimationFrame(() => {
        timeout = setTimeout(() => {
          if (window.visualViewport) {
            const vh = window.visualViewport.height;
            document.body.style.setProperty('--vh', `${vh}px`);
            document.body.style.overflow = 'hidden';
            setHeight(vh);
          }
        }, 300);
      });
    };
    setHeightFunc();
    window?.visualViewport?.addEventListener('resize', setHeightFunc);
    return () => {
      document.body.style.removeProperty('--vh');
      document?.body?.removeAttribute?.('style');
      window?.visualViewport?.removeEventListener('resize', setHeightFunc);
    };
  }, [enable]);

  return height;
};

type DialogContentPropsExtended = DialogContentProps & {
  isFooterPresent?: boolean;
  shouldApplyHeight?: boolean;
};

function CustomDialogContent({
  children,
  style = {},
  isFooterPresent = true,
  className,
  shouldApplyHeight = false,
  ...others
}: DialogContentPropsExtended) {
  const vh = useViewportDynamicHeight(shouldApplyHeight);
  let negetiveHeight = '';
  if (isIOS) {
    negetiveHeight = isFooterPresent ? '[--negetive-space:calc(var(--footer-h)-var(--head-h))]' : '[--negetive-space:0px]';
  } else {
    negetiveHeight = isFooterPresent ? '[--negetive-space:calc(var(--footer-h)-var(--head-h))]' : '[--negetive-space:var(--head-h)]';
  }

  return (
    <MuiDialogContent
      className={cn(
        'truncate-autocomplete overscroll-contain bg-[--dark-primary,white] px-4 py-3 [--footer-h:48px] [--head-h:60px]',
        negetiveHeight,
        shouldApplyHeight ? 'max-[560px]:!max-h-[calc(var(--vh)-var(--negetive-space))]' : '',
        isTablet || isMobile ? 'min-h-[250px]' : '',
        className
      )}
      style={
        {
          ...style,
          '--vh': vh
        } as CSSProperties
      }
      {...others}
    >
      {children}
    </MuiDialogContent>
  );
}

export default CustomDialogContent;
