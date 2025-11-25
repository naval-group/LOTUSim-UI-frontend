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
 * ****************************   SCENARIO DASHBOARD COMPONENT   **********************
 * ************************************************************************************
 *
 * Component under active development.
 * 
 * Provides a dashboard for viewing, selecting, and creating simulation scenarios.
 * Each simulation scenario consists of a collection of vessels and their configurations.
 * A scenario is spawned in the simulation along with environment conditions.
 *
 * Users can:
 * - View existing scenarios
 * - Select a scenario to launch
 * - Create a new scenario
 *
 */

import * as React from 'react';
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import Header from '../common/header';
import { Panels } from '../common/props';
import { Vessel } from '../map/map'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { listScenarios, createScenario, deleteScenario } from '../common/apis';

export interface Scenario {
    name: string;
    vessels: Vessel[];
}

export const ScenarioDashboard: React.FC = () => {
    const [scenarios, setScenarios] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    const [createDialogOpen, setCreateDialogOpen] = React.useState<boolean>(false);
    const [newScenarioName, setNewScenarioName] = React.useState<string>('');
    const [creatingScenario, setCreatingScenario] = React.useState<boolean>(false);

    const navigate = useNavigate();

    const fetchScenarios = async () => {
        try {
            setLoading(true);
            const scenarios = await listScenarios();
            setScenarios(scenarios);
            setError(null);
        } catch (err) {
            setError('Error fetching scenario list');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchScenarios();
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
        setNewScenarioName(event.target.value);
    };

    const handleCreateScenario = async () => {
        if (!newScenarioName) {
            alert('Please enter a name for the Scenario');
            return;
        }

        setCreatingScenario(true);

        try {
            const requestBody = {
                name: "Test Scenario",
                description: "This is a test scenario",
                vessels: {}
            };

            const result = await createScenario(requestBody);

            if (result) {
                setError(null); // Clear any error message
                handleDialogClose(); // Close the dialog
                fetchScenarios();
            } else {
                alert('Failed to create Scenario. Please try again.');
            }
        } catch (error) {
            alert('Error creating Scenario');
        } finally {
            setCreatingScenario(false);
        }
    };

    const handleScenarioClick = (ScenarioName: string) => {
        navigate(`/Scenarios/${ScenarioName}`);
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
                    Please select an Scenario from the options below
                </Typography>
            </Box>
            <Panels names={scenarios} onClick={handleScenarioClick} />
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                size="large"
                onClick={handleDialogOpen} // Open dialog on click
            >
                <AddIcon />
            </Fab>
            <Dialog open={createDialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Add New Scenario</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                        Enter a name for the new Scenario.
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Scenario Name"
                        value={newScenarioName}
                        onChange={handleNameChange}
                        sx={{ marginBottom: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button onClick={handleDialogClose} color="primary" disabled={creatingScenario}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateScenario}
                        color="primary"
                        disabled={creatingScenario || !newScenarioName}
                    >
                        {creatingScenario ? 'Creating...' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};
