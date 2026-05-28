import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
} from '@mui/material';

export interface ScenarioCreateParams {
  name: string;
  description: string;
  author: string;
  timeOfDay: string;
  date: string;
  latitude: string;
  longitude: string;
}

interface CreateScenarioDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (params: ScenarioCreateParams) => void;
}

const EMPTY: ScenarioCreateParams = {
  name: '',
  description: '',
  author: '',
  timeOfDay: '',
  date: '',
  latitude: '',
  longitude: '',
};

export const CreateScenarioDialog: React.FC<CreateScenarioDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [fields, setFields] = React.useState<ScenarioCreateParams>(EMPTY);

  const set = (key: keyof ScenarioCreateParams) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClose = () => {
    setFields(EMPTY);
    onClose();
  };

  const handleSubmit = () => {
    onCreate(fields);
    setFields(EMPTY);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New Scenario</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Fill in the details below. You can configure vessels after creation.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          required
          label="Scenario Name"
          variant="outlined"
          value={fields.name}
          onChange={set('name')}
          onKeyDown={(e) => e.key === 'Enter' && fields.name.trim() && handleSubmit()}
        />
        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          multiline
          rows={2}
          value={fields.description}
          onChange={set('description')}
        />
        <TextField
          fullWidth
          label="Author"
          variant="outlined"
          value={fields.author}
          onChange={set('author')}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              variant="outlined"
              value={fields.date}
              onChange={set('date')}
              slotProps={{
                inputLabel: { shrink: true },
                input: { sx: { '& ::-webkit-calendar-picker-indicator': { marginRight: '20px' } } },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Time of Day"
              type="time"
              variant="outlined"
              value={fields.timeOfDay}
              onChange={set('timeOfDay')}
              slotProps={{
                inputLabel: { shrink: true },
                input: { sx: { '& ::-webkit-calendar-picker-indicator': { marginRight: '20px' } } },
              }}
            />
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary">
          Origin Location 
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              variant="outlined"
              value={fields.latitude}
              onChange={set('latitude')}
              slotProps={{ htmlInput: { step: 'any', min: -90, max: 90 } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              variant="outlined"
              value={fields.longitude}
              onChange={set('longitude')}
              slotProps={{ htmlInput: { step: 'any', min: -180, max: 180 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!fields.name.trim()}>
          Create Scenario
        </Button>
      </DialogActions>
    </Dialog>
  );
};
