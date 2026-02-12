export const imageUploadMaxSize = { size: 1048576 * 10, text: '10 MB' };
export const documentUploadMaxSize = { size: 1048576 * 50, text: '50 MB' };

export const validateFileUpload = (
  file: File,
  user: any,
  dispatch: any,
  setErrorToast: any
): boolean => {
  let limitBytes = 0;
  let limitText = '';
  const BYTES_PER_MB = 1024 * 1024;
  
  const brandPolicy = user?.brandPolicy || {};

  const type = file.type.startsWith('image/') ? 'image' : 'document';

  if (type === 'image') {
    const policySizeMB = Number(brandPolicy?.imageUploadMaxSize);

    if (policySizeMB && policySizeMB > 0) {
      limitBytes = policySizeMB * BYTES_PER_MB;
      limitText = `${policySizeMB} MB`;
    } else {
      limitBytes = imageUploadMaxSize.size;
      limitText = imageUploadMaxSize.text;
    }
  } else {
    const policySizeMB = Number(brandPolicy?.documentUploadMaxSize);

    if (policySizeMB && policySizeMB > 0) {
      limitBytes = policySizeMB * BYTES_PER_MB;
      limitText = `${policySizeMB} MB`;
    } else {
      limitBytes = documentUploadMaxSize.size;
      limitText = documentUploadMaxSize.text;
    }
  }

  if (file.size > limitBytes) {
    if (dispatch && setErrorToast) {
      dispatch(setErrorToast({
        message: `${type === 'image' ? 'Image' : 'File'} must be less than ${limitText} size`
      }));
    }
    return false;
  }
  return true;
};