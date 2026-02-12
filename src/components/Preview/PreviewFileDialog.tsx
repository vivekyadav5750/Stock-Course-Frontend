import { Dialog } from '@mui/material';
import FilePreview from './FilePreview';
import CustomDialogHeader from '../CustomDialog/CustomDialogHeader';
import CustomDialogContent from '../CustomDialog/CustomDialogContent';

type PreviewFileDialogProps = {
  onClose: () => void;
  file: any;
  isPublic?: boolean;
};

const PreviewFileDialog = ({ onClose, file, isPublic = false }: PreviewFileDialogProps) => {
  return (
    <Dialog onClose={onClose} open={true} fullScreen>
      <CustomDialogHeader showRequiredLabel={false} title={file.name} onClose={onClose} />
      <CustomDialogContent className="flex flex-col">
        <FilePreview file={file} isPublic={isPublic} />
      </CustomDialogContent>
    </Dialog>
  );
};

export default PreviewFileDialog;
