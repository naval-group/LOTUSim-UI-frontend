import * as React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import Header from '../common/Header';
import { listScenarios, deleteScenario } from '../../services/api';
import { ScenarioCard } from './ScenarioCard';
import { CreateScenarioDialog, ScenarioCreateParams } from './CreateScenarioDialog';

export const ScenarioDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const fetchScenarios = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listScenarios();
      setScenarios(data);
    } catch {
      setError('Failed to load scenarios. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleCreate = (params: ScenarioCreateParams) => {
    setDialogOpen(false);
    navigate(`/scenarios/${encodeURIComponent(params.name)}`, {
      state: { isNew: true, ...params },
    });
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteScenario(name);
      setScenarios((prev) => prev.filter((s) => s !== name));
    } catch {
      setError('Failed to delete scenario.');
    }
  };

  const handleOpen = (name: string) => {
    navigate(`/scenarios/${encodeURIComponent(name)}`);
  };

  return (
    <Box sx={{ position: 'relative', paddingBottom: '80px', height: '100%', width: '100%' }}>
      <Header title="Lotusim" />

      {/* Content */}
      <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : scenarios.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography
              variant="h6"
              gutterBottom
              style={{ color: 'white', fontSize: '1.5rem', fontWeight: 500 }}
            >
              No scenarios yet
            </Typography>
            <Typography
              variant="body2"
              style={{ color: 'white', fontSize: '1.5rem', fontWeight: 500 }}
            >
              Click the + button to create your first scenario.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {scenarios.map((name) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={name}>
                <ScenarioCard name={name} onClick={handleOpen} onDelete={handleDelete} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* FAB */}
      <Fab
        color="primary"
        aria-label="create scenario"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreateScenarioDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </Box>
  );
};
