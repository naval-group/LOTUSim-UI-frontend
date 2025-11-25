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
 * *******************************   MAP CONTEXT MENU   *******************************
 * ************************************************************************************
 *
 * A simple right-click context menu for the map, providing quick actions such
 * as adding a vessel at the clicked position.
 *
 * Features:
 * - Appears at the clicked map position (absolute placement).
 * - Options:
 *    - Add Vessel → Opens the AddVesselMenu dialog.
 *    - Cancel → Closes the context menu.
 * - Closes automatically when clicking away (ClickAwayListener).
 *
 */

import React from "react";
import { ClickAwayListener, Paper, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

interface Props {
    position: { x: number; y: number };
    onAdd: () => void;
    onClose: () => void;
}

/**
 * Context menu component for map interactions.
 *
 * Renders a Material-UI Paper with menu options for adding a vessel or cancelling.
 * Positioned absolutely at the clicked location on the map.
 */
export const MapContextMenu: React.FC<Props> = ({ position, onAdd, onClose }) => (
    <ClickAwayListener onClickAway={onClose}>
        <Paper elevation={3} style={{ position: "absolute", top: position.y, left: position.x, zIndex: 1000 }}>
            <List component="nav">
                <ListItem>
                    <ListItemButton onClick={onAdd}>
                        <ListItemText primary="Add Vessel" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton onClick={onClose}>
                        <ListItemText primary="Cancel" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Paper>
    </ClickAwayListener>
);