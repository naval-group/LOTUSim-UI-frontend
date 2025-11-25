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
 * *****************************   INSTANCES DASHBOARD   ******************************
 * ************************************************************************************
 *
 * This module provides the `InstancesDashboard` component for the Lotusim application.
 * This is not fully developed yet, the backend API is not ready.
 *
 * Features:
 * - Displays a list of active instances fetched from the backend. 
 * - Allows users to create a new instance.
 * - Navigates to the selected instance details on click.
 *
 */

import * as React from 'react';
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import Header from '../common/header';
import { Panels } from '../common/props';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { listInstances, createInstance, deleteInstance } from '../common/apis';

interface Process {
    name: string;
    pid: number;
}

interface Instance {
    name: string;
    processes: Process[];
}

const InstancesDashboard: React.FC = () => {
    const [instances, setInstances] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    const [createDialogOpen, setCreateDialogOpen] = React.useState<boolean>(false);
    const [newInstanceName, setNewInstanceName] = React.useState<string>('');
    const [creatingInstance, setCreatingInstance] = React.useState<boolean>(false);

    const navigate = useNavigate();

    const fetchInstances = async () => {
        try {
            setLoading(true);
            const instances = await listInstances();
            setInstances(instances);
            setError(null);
        } catch (err) {
            setError('Error fetching instances list');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchInstances();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleDialogOpen = () => {
        setCreateDialogOpen(true);
    };

    const handleDialogClose = () => {
        setCreateDialogOpen(false);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewInstanceName(event.target.value);
    };

    const handleCreateInstance = async () => {
        if (!newInstanceName) {
            alert('Please enter a name for the instance');
            return;
        }

        setCreatingInstance(true);

        try {
            const requestBody = {
                name: "Test instance",
                description: "This is a test instance",
                processes: {}
            };

            const result = await createInstance(requestBody);
            if (result) {
                setError(null);
                handleDialogClose();
                fetchInstances();
            } else {
                alert('Failed to create instance. Please try again.');
            }
        } catch (error) {
            alert('Error creating instance');
        } finally {
            setCreatingInstance(false);
        }
    };

    const handleInstanceClick = (instanceName: string) => {
        navigate(`/instances/${instanceName}`);
    };

    return (
        <Box sx={{ position: 'relative', paddingBottom: '80px', height: '100%', width: '100%' }}>
            <Header title="Lotusim" />
            <Box sx={{ backgroundColor: '#e00909', padding: 2 }}>
                <Typography
                    variant="h6"
                    component="h2"
                    sx={{ textAlign: 'center', color: 'white' }}
                >
                    Please select an instance from the options below
                </Typography>
            </Box>
            <Panels names={instances} onClick={handleInstanceClick} />
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                size="large"
                onClick={handleDialogOpen}
            >
                <AddIcon />
            </Fab>
            <Dialog open={createDialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Add New Instance</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                        Enter a name for the new instance.
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Instance Name"
                        value={newInstanceName}
                        onChange={handleNameChange}
                        sx={{ marginBottom: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button onClick={handleDialogClose} color="primary" disabled={creatingInstance}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateInstance}
                        color="primary"
                        disabled={creatingInstance || !newInstanceName}
                    >
                        {creatingInstance ? 'Creating...' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default InstancesDashboard;
