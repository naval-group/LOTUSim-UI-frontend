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
 * ******************************   DASHBOARD COMPONENTS   ****************************
 * ************************************************************************************
 *
 * This module contains reusable React components for the dashboard:
 *
 * - `Panels`: Displays a grid of clickable items (instances, vessels, etc.).
 * - `MatrixInput`: Allows editing a numeric matrix through a grid of text fields.
 * - `identity6x6`: A 6x6 identity matrix helper.
 * - `parseMatrix`: Serializes a matrix to a JSON string.
 *
 */

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import { Box, Paper, TextField, Typography } from '@mui/material';

/**
 * ************************************************************************************
 * *******************************   PANEL ITEMS   ************************************
 * ************************************************************************************
 *
 * Components and helpers for displaying panels on the dashboard.
 */
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#38445c', // Blue background color
    color: '#FFFFFF', // White text color
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

interface PanelNamesProps {
    names: string[];
    onClick: (instanceName: string) => void;
}

/**
 * Panels Component
 *
 * Renders a grid of clickable items.
 *
 * @param names - Array of names to display in panels.
 * @param onClick - Callback when a panel is clicked, receives the name clicked.
 */
export const Panels: React.FC<PanelNamesProps> = ({ names, onClick }) => {
    return (
        <Box sx={{ width: '100%' }}>
            <Grid container rowSpacing={1} columnSpacing={1}>
                {
                    names.map((name, index) => (
                        <Grid size={4} key={index}>
                            <Item onClick={() => onClick(name)}>
                                {name}
                            </Item>
                        </Grid>
                    ))
                }
            </Grid>
        </Box >
    );
};

/**
 * ************************************************************************************
 * *******************************   MATRIX ITEMS   ***********************************
 * ************************************************************************************
 *
 * Components and helpers for rendering and editing numeric matrices on the dashboard.
 */
interface MatrixInputProps {
    label: string;
    matrix: number[][];
    onChange: (newMatrix: number[][]) => void;
}

/**
 * MatrixInput Component
 *
 * Renders a grid of numeric inputs to edit a 2D matrix.
 *
 * @param label - Label displayed above the matrix.
 * @param matrix - 2D array of numbers representing the current matrix.
 * @param onChange - Callback when the matrix is updated, returns the new matrix.
 */
export const MatrixInput: React.FC<MatrixInputProps> = ({ label, matrix, onChange }) => {
    const handleChange = (row: number, col: number, value: string) => {
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) return; // optionally handle invalid input
        const newMatrix = matrix.map((r, i) =>
            i === row
                ? r.map((c, j) => (j === col ? parsedValue : c))
                : r
        );
        onChange(newMatrix);
    };

    return (
        <Box mb={2}
            alignItems="center" gap={2}
            sx={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: 1,
                p: 2,
                mt: 2,
            }}>
            <Typography variant="subtitle1" gutterBottom>{label}</Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: 1,
                    width: '100%',
                    overflowX: 'hidden',
                }}
            >
                {matrix.map((row, rowIndex) =>
                    row.map((value, colIndex) => (
                        <TextField
                            key={`${rowIndex}-${colIndex}`}
                            type="number"
                            value={value}
                            onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                            size="small"
                            fullWidth
                            inputProps={{ style: { padding: '8px' } }}
                        />
                    ))
                )}

            </Box>
        </Box>
    );
};

/**
 * identity6x6
 *
 * 6x6 identity matrix.
 */
export const identity6x6 = Array(6).fill(null).map((_, i) =>
    Array(6).fill(0).map((_, j) => (i === j ? 1 : 0))
);

/**
 * parseMatrix
 *
 * Converts a matrix to a JSON string.
 *
 * @param matrix - 2D array of numbers
 * @returns JSON string representation of the matrix
 */
export function parseMatrix(matrix: number[][]): string {
    return JSON.stringify(matrix);
}
