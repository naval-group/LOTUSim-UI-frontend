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
import { VesselPosition, MASCmd, Scenario, GeoPoint, Agent } from '../types';

const DEFAULT_PORT = 5000;

/**
 * ************************************************************************************
 * ******************************   Server Configuration   ****************************
 * ************************************************************************************
 *
 * This section defines environment variables, wave, wind, weather.
 */
let currentIp: string = localStorage.getItem('ip') || 'localhost';
let currentPort: number = parseInt(localStorage.getItem('port') || DEFAULT_PORT.toString(), 10);

export const saveAddress = (ip: string, port: number) => {
  localStorage.setItem('ip', ip);
  localStorage.setItem('port', port.toString());
  currentIp = ip;
  currentPort = port;
};

export const getAddress = (): { ip: string; port: number } => {
  const ip = localStorage.getItem('ip') || 'localhost';
  const port = parseInt(localStorage.getItem('port') || DEFAULT_PORT.toString(), 10);
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
 * - Environment settings to be implemented.
 */

interface GetScenarioResponse {
  success: boolean;
  count: number;
  scenarios: string[];
}

export const listScenarios = async (): Promise<string[]> => {
  try {
    const response = await axios.get<GetScenarioResponse>(
      `http://${currentIp}:${currentPort}/scenarios`
    );
    return response.data.scenarios;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    const detail = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch scenarios: ${detail}`);
  }
};

export interface CreateScenarioRequest {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  tags?: string[];
  timeOfDay?: string;
  date?: string;
  referencePosition?: GeoPoint;
  agents?: {
    [agentName: string]: Agent;
  };
}

export interface ScenarioResponse {
  success: boolean;
  message: string;
  scenario_id?: string;
  file_path?: string;
  data?: Record<string, unknown>;
}

/**
 * POST /scenario
 * Creates a new scenario YAML file.
 * Returns the created scenario's ID and file path on success.
 */
export const createScenario = async (
  scenario: CreateScenarioRequest
): Promise<ScenarioResponse | null> => {
  try {
    const response = await axios.post<ScenarioResponse>(
      `http://${currentIp}:${currentPort}/scenario`,
      scenario
    );
    return response.data;
  } catch (error) {
    console.error('Error creating scenario:', error);
    return null;
  }
};

/**
 * DELETE /scenario/:name
 * Deletes a scenario file by name.
 * The name can be provided with or without the .yaml/.yml extension.
 * Returns true if deletion was successful.
 */
export const deleteScenario = async (name: string): Promise<boolean> => {
  try {
    const response = await axios.delete<ScenarioResponse>(
      `http://${currentIp}:${currentPort}/scenario/${name}`
    );
    return response.status === 200 && response.data.success;
  } catch (error) {
    console.error(`Error deleting scenario '${name}':`, error);
    return false;
  }
};

export const getScenario = async (filename: string): Promise<Scenario | null> => {
  try {
    const response = await axios.get<{
      data: { agents?: Record<string, Agent> } & Omit<Scenario, 'agents'>;
    }>(`http://${currentIp}:${currentPort}/scenario/${filename}`);
    const data = response.data.data;
    return {
      ...data,
      filename,
      agents: new Map<string, Agent>(Object.entries(data.agents || {})),
    };
  } catch (error) {
    console.error('Error fetching scenario:', error);
    return null;
  }
};

/**
 * PUT /scenario/:file_name
 * Updates an existing scenario file.
 * The file must already exist; use createScenario() to create new ones.
 * The file_name can be provided with or without the .yaml/.yml extension.
 */
export const updateScenario = async (
  fileName: string,
  scenario: CreateScenarioRequest
): Promise<ScenarioResponse | null> => {
  try {
    const response = await axios.put<ScenarioResponse>(
      `http://${currentIp}:${currentPort}/scenario/${fileName}`,
      scenario
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating scenario '${fileName}':`, error);
    return null;
  }
};

/**
 * ************************************************************************************
 * *******************************   MODELS APIs   ************************************
 * ************************************************************************************
 * This APIs handle all the assets (3D models, images) used for vessels.
 */
interface ModelsResponse {
  success: boolean;
  count: number;
  models: string[];
}

export const listModels = async (): Promise<string[]> => {
  try {
    const response = await axios.get<ModelsResponse>(`http://${currentIp}:${currentPort}/models`);
    return response.data.models;
  } catch (error) {
    console.error('Error fetching Models:', error);
    return [];
  }
};

export const createModel = async (
  requestBody: Record<string, unknown>,
  stlFile: File,
  image: File
): Promise<boolean> => {
  try {
    await axios.post(`http://${currentIp}:${currentPort}/model`, requestBody);
  } catch (error) {
    console.error('Error creating Model files:', error);
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('stlFile', stlFile);
    formData.append('image', image);
    formData.append('modelName', requestBody.modelName as string);
    await axios.post(`http://${currentIp}:${currentPort}/upload`, formData);
  } catch (error) {
    console.error('Error uploading stl/image files:', error);
    return false;
  }

  return true;
};

export const deleteModel = async (name: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`http://${currentIp}:${currentPort}/model`, {
      params: { name },
    });
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting Model:', error);
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
interface GetInstancesResponse {
  success: boolean;
  instances: string[];
}

export const listInstances = async (): Promise<string[]> => {
  try {
    const response = await axios.get<GetInstancesResponse>(`http://${currentIp}:${currentPort}/instances`);
    return response.data.instances ?? [];
  } catch (error) {
    console.error('Error fetching instances:', error);
    const detail = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch instances: ${detail}`);
  }
};

export const createInstance = async (requestBody: Record<string, unknown>): Promise<boolean> => {
  try {
    const response = await axios.post(`http://${currentIp}:${currentPort}/instances`, requestBody);
    return response.status === 200;
  } catch (error) {
    console.error('Error creating Instance:', error);
    return false;
  }
};

export const deleteInstance = async (name: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`http://${currentIp}:${currentPort}/instances/${name}`);
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting Instance:', error);
    return false;
  }
};

/**
 * ************************************************************************************
 * ******************************   Simulation runtime APIs   *************************
 * ************************************************************************************
 * An Instance is defined as a running process of lotusim
 *
 * These APIs is to interact with a running simulation instance
 */

/**
 * GET /instance/:instance/vessels
 * Fetches all vessels and their positions for a given instance.
 */
export const getVessels = async (instance: string): Promise<VesselPosition[]> => {
  if (!instance) throw new Error('Instance is required');
  try {
    const response = await axios.get<VesselPosition[]>(
      `http://${currentIp}:${currentPort}/instance/${instance}/vessels`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching vessels for instance '${instance}':`, error);
    return [];
  }
};

/**
 * GET /instance/:instance/vessel?name=
 * Fetches the position of a specific vessel by name within an instance.
 */
export const getVesselPosition = async (
  instance: string,
  vesselName: string
): Promise<VesselPosition | null> => {
  if (!instance) throw new Error('Instance is required');
  try {
    const response = await axios.get<VesselPosition>(
      `http://${currentIp}:${currentPort}/instance/${instance}/vessel`,
      { params: { name: vesselName } }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching position for vessel '${vesselName}' in instance '${instance}':`,
      error
    );
    return null;
  }
};

/**
 * POST /instance/:instance/vessel
 * Sends a single MAS command to a vessel within an instance.
 */
export const sendMASCommand = async (instance: string, cmd: MASCmd): Promise<boolean> => {
  if (!instance) throw new Error('Instance is required');
  try {
    const response = await axios.post(
      `http://${currentIp}:${currentPort}/instance/${instance}/vessel`,
      cmd
    );
    return response.status === 200;
  } catch (error) {
    console.error(`Error sending MAS command to instance '${instance}':`, error);
    const detail = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to send command: ${detail}`);
  }
};

/**
 * POST /instance/:instance/vessels
 * Sends multiple MAS commands to vessels within an instance.
 */
export const sendMASCommandArray = async (instance: string, cmds: MASCmd[]): Promise<boolean> => {
  if (!instance) throw new Error('Instance is required');
  try {
    const response = await axios.post(
      `http://${currentIp}:${currentPort}/instance/${instance}/vessels`,
      { cmd: cmds }
    );
    return response.status === 200;
  } catch (error) {
    console.error(`Error sending MAS command array to instance '${instance}':`, error);
    return false;
  }
};

/**
 * DELETE /instance/:instance/vessels
 * Deletes all vessels in a given instance.
 */
export const deleteAllVessels = async (instance: string): Promise<boolean> => {
  if (!instance) throw new Error('Instance is required');
  try {
    const response = await axios.delete(
      `http://${currentIp}:${currentPort}/instance/${instance}/vessels`
    );
    return response.status === 200;
  } catch (error) {
    console.error(`Error deleting vessels for instance '${instance}':`, error);
    return false;
  }
};

/**
 * POST /instance/:instance/start-scenario
 * Launches a scenario on a given instance.
 * Returns true if the launch request was accepted.
 */
export const startScenario = async (instance: string, scenarioName: string): Promise<boolean> => {
  if (!instance) throw new Error('Instance is required');
  try {
    const response = await axios.post<{ success: boolean; message: string; referencePosition?: GeoPoint }>(
      `http://${currentIp}:${currentPort}/instance/${instance}/start-scenario`,
      { scenario_name: scenarioName }
    );
    const ref = response.data.referencePosition;
    if (ref) {
      localStorage.setItem('mapCenter', JSON.stringify([ref.latitude, ref.longitude]));
    }
    return response.status === 200;
  } catch (error) {
    const responseMessage = axios.isAxiosError(error) && (error.response?.data as { message?: string })?.message;
    const detail = responseMessage || (error instanceof Error ? error.message : 'Unknown error');
    throw new Error(`Failed to start scenario: ${detail}`);
  }
};

/**
 * POST /instance/:instance/stop-scenario
 * Stops the currently running scenario on a given instance.
 * Returns true if the stop request was accepted.
 */
export const stopScenario = async (instance: string): Promise<boolean> => {
  if (!instance) throw new Error('Instance is required');
  try {
    const response = await axios.post(
      `http://${currentIp}:${currentPort}/instance/${instance}/stop-scenario`
    );
    return response.status === 200;
  } catch (error) {
    console.error(`Error stopping scenario on instance '${instance}':`, error);
    const detail = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to stop scenario: ${detail}`);
  }
};
