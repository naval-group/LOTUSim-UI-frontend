/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import * as React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MapIcon from '@mui/icons-material/Map';

interface ScenarioCardProps {
  name: string;
  onClick: (name: string) => void;
  onDelete: (name: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ name, onClick, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete scenario "${name}"?`)) {
      onDelete(name);
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
      }}
    >
      <CardActionArea onClick={() => onClick(name)} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MapIcon color="primary" fontSize="large" />
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Delete scenario">
          <IconButton size="small" color="error" onClick={handleDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
