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
 * ******************************   TYPES & UTILS   **********************************
 * ************************************************************************************
 *
 * This module contains TypeScript interfaces and utility functions used for:
 * - Vessel and position data (`LatLongPosition`, `VesselData`, `Pose`, etc.)
 * - Utility functions such as `radToDeg` for angle conversion.
 *
 */

export interface LatLongPosition {
    latitude: number;
    longitude: number;
    elevation: number;
    // Referencing north 0 degree
    heading: number;
}

export interface VesselData {
    vessel_name: string;
    pose: LatLongPosition;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface Pose {
    position: Vector3;
    orientation: Quaternion;
}

export function radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
}
