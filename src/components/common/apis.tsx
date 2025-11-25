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
 * *******************************   REST API CLIENT   ********************************
 * ************************************************************************************
 *
 * This module provides TypeScript wrappers around the backend REST APIs.
 *
 * - Centralizes all HTTP calls made to the server (via Axios).
 * - Each section groups related endpoints (Server, Scenario, Instance, Model).
 * - Responses are strongly typed using TypeScript generics.
 * - Local storage is used to persist server address and active instance.
 *
 */

import axios from 'axios';

/**
 * ************************************************************************************
 * ******************************   Server Configuration   ****************************
 * ************************************************************************************
 *
 * This section defines environment variables, wave, wind, weather.
 */
let currentIp: string = localStorage.getItem('ip') || 'localhost';
let currentPort: number = parseInt(localStorage.getItem('port') || '5000', 10);

export const saveAddress = (ip: string, port: number) => {
    localStorage.setItem('ip', ip);
    localStorage.setItem('port', port.toString());
    currentIp = ip;
    currentPort = port;
};

export const getAddress = (): { ip: string, port: number } => {
    const ip = localStorage.getItem('ip') || 'localhost';
    const port = parseInt(localStorage.getItem('port') || '5000', 10);

    return { ip, port };
};

export const saveInstance = (instance: string) => {
    localStorage.setItem('instance', instance);
};

export const getInstance = (): string => {
    return localStorage.getItem('instance') || '';
};

/**
 * ************************************************************************************
 * *******************************   SCENARIO APIs   **********************************
 * ************************************************************************************
 *
 * A Scenario is defined as a group of vessels, weather, and environment settings.
 *
 * - Scenarios are saved as JSON files on the server.
 * - They can be loaded through mascmd when scenario is launched. 
 * - Weather settings to be implemented.
 */

export const listScenarios = async (): Promise<string[]> => {
    try {
        const response = await axios.get<string[]>(`http://${currentIp}:${currentPort}/scenarios`);
        return response.data;
    } catch (error) {
        console.error("Error fetching scenarios:", error);
        return [];
    }
};

export const createScenario = async (requestBody: Record<string, any>): Promise<boolean> => {
    try {
        const response = await axios.post(`http://${currentIp}:${currentPort}/scenarios`, requestBody);
        return response.status === 200;
    } catch (error) {
        console.error("Error creating scenario:", error);
        return false;
    }
};

export const deleteScenario = async (name: string): Promise<boolean> => {
    try {
        const response = await axios.delete(`http://${currentIp}:${currentPort}/scenarios/${name}`,);
        return response.status === 200;
    } catch (error) {
        console.error("Error deleting scenario:", error);
        return false;
    }
};


/**
 * ************************************************************************************
 * ******************************   INSTANCES APIs   **********************************
 * ************************************************************************************
 * An Instance is defined as a running process of lotusim
 * 
 * This is yet to be implemented but the idea is that there is multiple instance running for RL training
 */
export const listInstances = async (): Promise<string[]> => {
    try {
        const response = await axios.get<string[]>(`http://${currentIp}:${currentPort}/instances`);
        return response.data;
    } catch (error) {
        console.error("Error fetching instances:", error);
        return [];
    }
};

export const createInstance = async (requestBody: Record<string, any>): Promise<boolean> => {
    try {
        const response = await axios.post(`http://${currentIp}:${currentPort}/instances`, requestBody);
        return response.status === 200;
    } catch (error) {
        console.error("Error creating Instance:", error);
        return false;
    }
};

export const deleteInstance = async (name: string): Promise<boolean> => {
    try {
        const response = await axios.delete(`http://${currentIp}:${currentPort}/instances/${name}`);
        return response.status === 200;
    } catch (error) {
        console.error("Error deleting Instance:", error);
        return false;
    }
};

export const spawnVesselOnInstance = async (instanceName: string, mascmd: string): Promise<boolean> => {
    try {
        const response = await axios.post(`http://${currentIp}:${currentPort}/instance/${instanceName}/vessel`, mascmd, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            console.log("Vessel spawned successfully:", response.data);
            return true;
        } else {
            console.error("Failed to spawn vessel:", response.data);
            return false;
        }
    } catch (error) {
        console.error("Error spawning vessel:", error);
        return false;
    }

};

/**
 * ************************************************************************************
 * *******************************   MODELS APIs   ************************************
 * ************************************************************************************
 * This APIs handle all the assets (3D models, images) used for vessels.
 */
export const listModels = async (): Promise<string[]> => {
    try {
        const response = await axios.get<string[]>(`http://${currentIp}:${currentPort}/models`);
        return response.data;
    } catch (error) {
        console.error("Error fetching Models:", error);
        return [];
    }
};

export const createModel = async (requestBody: Record<string, any>, stlFile: File, image: File): Promise<boolean> => {
    try {
        await axios.post(`http://${currentIp}:${currentPort}/model`, requestBody);
    } catch (error) {
        console.error("Error creating Model files:", error);
        return false;
    }

    try {
        const formData = new FormData();
        formData.append('stlFile', stlFile);
        formData.append('image', image);
        formData.append('modelName', requestBody.modelName);
        await axios.post(`http://${currentIp}:${currentPort}/upload`, formData);

    } catch (error) {
        console.error("Error uploading stl/image files:", error);
        return false;

    }

    return true;
};

export const deleteModel = async (name: string): Promise<boolean> => {
    try {
        const response = await axios.delete(`http://${currentIp}:${currentPort}/model`, {
            params: { name }
        }
        );
        return response.status === 200;
    } catch (error) {
        console.error("Error deleting Model:", error);
        return false;
    }
};