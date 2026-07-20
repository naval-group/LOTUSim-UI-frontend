/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * ************************************************************************************
 * *******************************   MODEL DASHBOARD   *********************************
 * ************************************************************************************
 *
 * The main dashboard for managing simulation models in Lotusim.
 *
 * Features:
 * - Displays a list of available simulation models.
 * - Supports creating and deleting models.
 * - Integrates AddModelDialog for model creation.
 * - Uses ModelPanels to show models and provide delete actions.
 * - Uses a floating action button (FAB) to add a new model.
 * - Fetches model list from backend APIs (listModels, createModel, deleteModel).
 *
 */

import * as React from 'react';
import Header from '../common/Header';
import ModelPanels from './ModelPanel';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import { Box } from '@mui/material';
import { listModels, createModel, deleteModel } from '../../services/api';
import { AddModelDialog } from './ModelAdd';

const ModelDashboard: React.FC = () => {
  const [folders, setFolders] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = React.useState<boolean>(false);
  const [openAddModelDialog, setOpenAddModelDialog] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const models = await listModels();
        setFolders(models);
        setError(null);
      } catch (_err) {
        setError('Error fetching folder list');
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [refreshFlag]);

  const handleDelete = async (modelName: string) => {
    console.log('Delete called');
    try {
      const result = await deleteModel(modelName);
      if (result) {
        setRefreshFlag((prev) => !prev);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error(`Error deleting model "${modelName}":`, err);
    }
  };

  const handleSave = async (requestBody: Record<string, unknown>, stlFile: File, image: File) => {
    try {
      await createModel(requestBody, stlFile, image);
      setOpenAddModelDialog(false);
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Box
      sx={{
        position: 'relative',
        paddingBottom: '64px',
        height: '100%',
        width: '100%',
        backgroundColor: '#494949ff',
      }}
    >
      <Header title="Lotusim" />
      <ModelPanels modelNameList={folders} handleDelete={handleDelete} />
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        size="large"
        onClick={() => setOpenAddModelDialog(true)}
      >
        <AddIcon />
      </Fab>
      <AddModelDialog
        open={openAddModelDialog}
        onClose={() => setOpenAddModelDialog(false)}
        onSave={handleSave}
      />
    </Box>
  );
};

export default ModelDashboard;
