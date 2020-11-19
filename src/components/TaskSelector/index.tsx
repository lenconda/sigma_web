import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import './index.less';

export interface TaskSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <Dialog open={visible} fullWidth={true} classes={{ root: 'task-selector' }}>
      <DialogTitle>
        <Typography noWrap={true} variant="h6">
          aosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidjaosijdaosijdaosidj
        </Typography>
      </DialogTitle>
      {
        loading && <LinearProgress color="primary" />
      }
      <DialogContent classes={{ root: 'task-selector__content' }}>
        aasdasdasdas
      </DialogContent>
    </Dialog>
  );
};

export default TaskSelector;
