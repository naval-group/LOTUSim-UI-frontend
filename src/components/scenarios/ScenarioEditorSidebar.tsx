import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Agent, GeoPoint } from '../../types';

interface Props {
  open: boolean;
  onToggle: () => void;
  timeOfDay: string;
  setTimeOfDay: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  referencePosition: GeoPoint;
  setReferencePosition: (fn: (prev: GeoPoint) => GeoPoint) => void;
  agents: Map<string, Agent>;
  onDeleteAgent: (name: string) => void;
  onEditAgent: (agent: Agent) => void;
  onFocusAgent: (agent: Agent) => void;
}

export const ScenarioEditorSidebar: React.FC<Props> = ({
  open,
  onToggle,
  timeOfDay,
  setTimeOfDay,
  date,
  setDate,
  referencePosition,
  setReferencePosition,
  agents,
  onDeleteAgent,
  onEditAgent,
  onFocusAgent,
}) => (
  <Paper
    elevation={3}
    sx={{
      width: open ? { xs: 200, sm: 240, md: 280, lg: 320 } : 28,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius: 0,
      transition: 'width 0.25s ease',
    }}
  >
    <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0, width: 0 }}>
      <Box sx={{ p: 2, width: '100%', boxSizing: 'border-box' }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1.5}>
          Scenario Settings
        </Typography>

        <TextField
          label="Time of Day (Not Implmeneted)"
          value={timeOfDay}
          fullWidth
          size="small"
          sx={{ mb: 1.5 }}
          onChange={(e) => setTimeOfDay(e.target.value)}
        />
        <TextField
          label="Date (Not Implmeneted)"
          value={date}
          fullWidth
          size="small"
          sx={{ mb: 1.5 }}
          onChange={(e) => setDate(e.target.value)}
        />

        <Typography variant="subtitle2" fontWeight="bold" mt={0.5} mb={1}>
          Reference Position
        </Typography>
        {(['latitude', 'longitude', 'altitude'] as const).map((field) => (
          <TextField
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            value={referencePosition[field]}
            type="number"
            fullWidth
            size="small"
            sx={{ mb: 1 }}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setReferencePosition((prev) => ({ ...prev, [field]: val }));
            }}
          />
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
          Agents ({agents.size})
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Right-click on the map to add a vessel
        </Typography>

        {agents.size === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No agents added yet.
          </Typography>
        ) : (
          <List dense disablePadding>
            {Array.from(agents.entries()).map(([name, agent]) => (
              <ListItem
                key={name}
                disablePadding
                onClick={() => onFocusAgent(agent)}
                sx={{ borderBottom: '1px solid', borderColor: 'divider', pr: 5, cursor: 'pointer' }}
                secondaryAction={
                  <Box display="flex">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAgent(agent);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAgent(agent.name);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={name}
                  secondary={`${agent.model} · ${agent.position.latitude.toFixed(4)}, ${agent.position.longitude.toFixed(4)}`}
                  slotProps={{
                    primary: { variant: 'body2', fontWeight: 'bold' },
                    secondary: { variant: 'caption' },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>

    <Box
      sx={{
        width: 28,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeft: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={onToggle}
    >
      {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
    </Box>
  </Paper>
);
