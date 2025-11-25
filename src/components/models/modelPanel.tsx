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
 * *******************************   MODEL PANELS COMPONENT   ************************
 * ************************************************************************************
 *
 * Displays a responsive grid of model previews with options to edit or delete each model.
 *
 * Features:
 * - Uses Material-UI ImageList to display model previews.
 * - Responsive column count based on screen size (xs, sm, md).
 * - Fetches preview images from the server using model names.
 * - Provides delete functionality for each model.
 * - (Optional) Edit functionality can be enabled via handleEdit callback.
 *
 * Props:
 * - model_name_list: string[] — Array of model names to display.
 * - handleEdit: (modelName: string) => void — Callback when the edit button is clicked.
 * - handleDelete: (modelName: string) => void — Callback when the delete button is clicked.
 *
 */

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import { getAddress } from '../common/apis';
import { useTheme, useMediaQuery } from '@mui/material';

interface ModelPanelsProps {
    model_name_list: string[];
    handleEdit: (modelName: string) => void;
    handleDelete: (modelName: string) => void;
}

const ModelPanels: React.FC<ModelPanelsProps> = ({ model_name_list, handleDelete, handleEdit }) => {
    if (model_name_list.length === 0) {
        return <p>No models available</p>;
    }

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const cols = isXs ? 1 : isSm ? 2 : isMd ? 4 : 3;

    const { ip, port } = getAddress();

    return (
        <ImageList style={{ width: '100%', height: '100%' }} cols={cols} rowHeight={300}>
            {model_name_list.map((model_name) => (
                <ImageListItem key={model_name} style={{ height: '500px', width: '100%', overflow: 'hidden' }}>
                    <img
                        src={`http://${ip}:${port}/models/${model_name}/preview`}
                        alt={model_name}
                        loading="lazy"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            backgroundColor: "#282c34"
                        }}
                    />
                    <ImageListItemBar
                        title={model_name}
                        actionIcon={
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {/* TODO: Edit not handled. */}
                                {/* <IconButton
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.54)",
                                        "&:hover": { color: "white" },
                                    }}
                                    aria-label={`edit ${model_name}`}
                                    onClick={() => handleEdit(model_name)}
                                >
                                    <EditIcon />
                                </IconButton> */}
                                <IconButton
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.54)",
                                        "&:hover": { color: "white" },
                                    }}
                                    aria-label={`delete ${model_name}`}
                                    onClick={() => handleDelete(model_name)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        }
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
};

export default ModelPanels;
