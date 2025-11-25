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
 * *******************************   EDIT MODEL DIALOG   ******************************
 * ************************************************************************************
 *
 * Dialog component for editing the name of an existing simulation model.
 *
 * Features:
 * - Displays the current model name in a text field.
 * - Allows the user to modify the name.
 * - Provides Cancel and Save buttons.
 * - Calls onSave callback with the old and new model names when saved.
 * - Calls onClose callback to close the dialog without saving.
 *
 * Props:
 * - open: boolean — Whether the dialog is open.
 * - modelName: string — Current name of the model to edit.
 * - onClose: () => void — Callback to close the dialog.
 * - onSave: (modelName: string, newName: string) => void — Callback called with old and new names.
 *
 */

import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField
} from '@mui/material';

interface EditDialogProps {
    open: boolean;
    modelName: string;
    onClose: () => void;
    onSave: (modelName: string, newName: string) => void;
}

// TODO
const EditDialog: React.FC<EditDialogProps> = ({ open, modelName, onClose, onSave }) => {
    const [newName, setNewName] = React.useState<string>(modelName);

    const handleSave = () => {
        onSave(modelName, newName);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogContent>
                <TextField
                    label="Model Name"
                    fullWidth
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDialog;
