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
 * - Supports creating, editing, and deleting models.
 * - Integrates AddModelDialog and EditDialog for model creation and modification.
 * - Uses ModelPanels to show models and provide edit/delete actions.
 * - Uses a floating action button (FAB) to add a new model.
 * - Fetches model list from backend APIs (listModels, createModel, deleteModel).
 *
 */

import * as React from 'react';
import Header from "../common/header";
import ModelPanels from "./modelPanel"
import EditDialog from "./modelEdit"
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import { Box } from '@mui/material';
import { listModels, createModel, deleteModel } from '../common/apis';
import { AddModelDialog } from "./modelAdd"

const ModelDashboard: React.FC = () => {
    const [folders, setFolders] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [refreshFlag, setRefreshFlag] = React.useState<boolean>(false);

    const [openEditModelDialog, setOpenEditModelDialog] = React.useState<boolean>(false);
    const [openAddModelDialog, setOpenAddModelDialog] = React.useState<boolean>(false);
    const [currentModel, setCurrentModel] = React.useState<string>('');


    React.useEffect(() => {
        const fetchFolders = async () => {
            try {
                setLoading(true);
                const models = await listModels();
                setFolders(models);
                setError(null);
            } catch (err) {
                setError("Error fetching folder list");
            } finally {
                setLoading(false);
            }
        };

        fetchFolders();
    }, [refreshFlag]);

    const handleDelete = async (modelName: string) => {
        console.log("Delete called");
        try {
            const result = await deleteModel(modelName);
            if (result) {
                setRefreshFlag(prev => !prev);
            } else {
                throw new Error("Failed to delete");
            }
        } catch (err) {
            console.error(`Error deleting model "${modelName}":`, err);
        }
    };

    const handleEdit = (modelName: string) => {
        setCurrentModel(modelName);
        setOpenEditModelDialog(true);
    };

    const handleAdd = () => {
        setOpenAddModelDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenEditModelDialog(false);
        setOpenAddModelDialog(false);
    };

    const handleSave = async (requestBody: Record<string, any>, stlFile: File, image: File) => {
        console.log(`Saving model with body:\n`, requestBody);

        try {
            // Await the async createModel function to handle errors properly
            await createModel(requestBody, stlFile, image);
            setOpenEditModelDialog(false);
            setRefreshFlag(prev => !prev);
        } catch (error) {
            console.error('Failed to create model:', error);
            // Optionally show some error UI here
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <Box sx={{ position: 'relative', paddingBottom: '64px', height: '100%', width: '100%', backgroundColor: "#494949ff" }}>
            <Header title="Lotusim" />
            <ModelPanels model_name_list={folders} handleDelete={handleDelete} handleEdit={handleEdit} />
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                size='large'
                onClick={handleAdd}
            >
                <AddIcon />
            </Fab>
            <EditDialog
                open={openEditModelDialog}
                modelName={currentModel}
                onClose={handleCloseDialog}
                onSave={handleSave}
            />
            <AddModelDialog
                open={openAddModelDialog}
                onClose={handleCloseDialog}
                onSave={handleSave}
            />
        </Box>
    );
};

export default ModelDashboard;
