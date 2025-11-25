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
 * ******************************   WEBSOCKET CLIENT   ********************************
 * ************************************************************************************
 *
 * This module provides the `WebSocketClient` class to connect to the backend WebSocket server.
 *
 * Features:
 * - Connects to the server using IP and port from `getAddress()`.
 * - Sends client instance name to the server.
 * - Receives and validates `VesselData[]` messages.
 * - Provides a callback mechanism to handle incoming vessel data.
 *
 */

import { getAddress, getInstance } from '../common/apis';
import { VesselData } from './interfaces';

/**
 * WebSocketClient
 *
 * Manages a WebSocket connection to receive real-time vessel data from the server.
 *
 * @example
 * const client = new WebSocketClient((data) => {
 *    console.log('Received vessel data:', data);
 * });
 * client.connect();
 */
export class WebSocketClient {

    private ws: WebSocket | null = null;

    private vesselDataCallback: (data: VesselData[]) => void; // Store the callback function

    constructor(vesselDataCallback: (data: VesselData[]) => void) {
        this.vesselDataCallback = vesselDataCallback;
    }

    /**
     * Initializes the WebSocket connection and sets up event handlers.
     */
    public connect(): void {
        console.log('WebSocket connecting.');

        if (this.ws) {
            console.log('WebSocket is already connected.');
            return;
        }
        const address = getAddress();

        this.ws = new WebSocket(`ws://${address.ip}:5000`);

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            this.sendClientName();
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = (event) => {
            if (event.wasClean) {
                console.log('Closed cleanly');
            } else {
                console.error('Connection died');
            }
        };
    }

    /**
     * Closes the WebSocket connection.
     */
    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            console.log('WebSocket connection closed.');
        }
    }

    /**
     * Sends the client name to the WebSocket server.
     */
    public sendClientName(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const instance = getInstance();
            this.ws.send(JSON.stringify({ instance }));
            console.log(`Sent client name: ${instance}`);
        } else {
            console.error('WebSocket connection is not open.');
        }
    }

    /**
     * Handles incoming WebSocket messages, parses them, and calls the callback.
     * 
     * @param event - The WebSocket message event.
     */
    private handleMessage(event: MessageEvent): void {
        try {
            const data: VesselData[] = JSON.parse(event.data);
            if (Array.isArray(data) && data.every(item => item.vessel_name && item.pose)) {
                this.vesselDataCallback(data);
            } else {
                console.warn('Received unexpected data format:', data);
            }
        } catch (error) {
            console.error('Error parsing incoming data:', error);
        }
    }
}
