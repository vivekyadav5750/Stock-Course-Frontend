import { Dialog } from '@mui/material';
import LessonPreview from './LessonPreview';
import CustomDialogHeader from '../CustomDialog/CustomDialogHeader';
import CustomDialogContent from '../CustomDialog/CustomDialogContent';

type PreviewLessonDialogProps = {
  onClose: () => void;
  lesson: any;
};

const PreviewLessonDialog = ({ onClose, lesson }: PreviewLessonDialogProps) => {
  return (
    <Dialog onClose={onClose} open={true} fullScreen>
      <CustomDialogHeader 
        showRequiredLabel={false} 
        title={lesson.title || 'Lesson Preview'} 
        onClose={onClose} 
      />
      <CustomDialogContent className="flex flex-col">
        {lesson.description && (
          <p className="text-sm text-gray-600 mb-4 px-4">{lesson.description}</p>
        )}
        <LessonPreview lesson={lesson} />
      </CustomDialogContent>
    </Dialog>
  );
};

export default PreviewLessonDialog;
