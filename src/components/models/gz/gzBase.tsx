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
 * *******************************   GZ BASE PANEL   **********************************
 * ************************************************************************************
 *
 * A reusable panel component that allows users to upload a 3D model (.stl) file
 * and an image file (e.g., .png, .jpg, .jpeg) to create a new model in Gazebo for Lotusim
 *
 */

import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
} from '@mui/material';

export interface GzBasePanel {
    stlFile: File | null;
    image: File | null;
    setSTL: React.Dispatch<React.SetStateAction<File | null>>;
    setImage: React.Dispatch<React.SetStateAction<File | null>>;

}

export const GzBasePanel: React.FC = ({ stlFile, image, setSTL, setImage }) => {

    const stlFileInputRef = useRef<HTMLInputElement>(null);
    const imageFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (type: 'stl' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (type === 'stl') {
                setSTL(file);
            } else if (type === 'image') {
                setImage(file);
            }
        }
    };

    return (
        <Box>
            <input
                type="file"
                accept=".stl"
                style={{ display: 'none' }}
                ref={stlFileInputRef}
                onChange={handleFileChange('stl')}
            />
            <Box mt={1} mb={2} display="flex" alignItems="center" gap={2}>
                <Button variant="outlined" onClick={() => stlFileInputRef.current?.click()}>
                    Select STL File
                </Button>
                {stlFile && <Typography mt={1}>Selected file: {stlFile.name}</Typography>}
            </Box>

            <input
                type="file"
                accept=".png,.jpg,.jpeg"
                style={{ display: 'none' }}
                ref={imageFileInputRef}
                onChange={handleFileChange('image')}
            />
            <Box mt={1} mb={2} display="flex" alignItems="center" gap={2}>
                <Button variant="outlined" onClick={() => imageFileInputRef.current?.click()}>
                    Select Image File
                </Button>
                {image && <Typography mt={1}>Selected file: {image.name}</Typography>}
            </Box>
        </Box>

    );
};