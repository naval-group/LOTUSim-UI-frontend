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
 * - Vessel and position data (`GeoPoint`, `VesselPosition`, `Pose`, etc.)
 * - Utility functions such as `radToDeg` for angle conversion.
 *
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface VesselPosition {
  vesselName: string;
  geoPoint?: GeoPoint;
  pose?: Pose;
  heading?: number;
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

/**
 * LOTUSim based ROS 2 messages
 */

export interface MASCmd {
  cmdType: 0 | 1 | 2; // CREATE_CMD | DELETE_CMD | MOVE_CMD
  sdfString?: string;
  modelName?: string;
  vesselName?: string;
  entity?: number;
  vesselPosition?: Pose;
  geoPoint?: GeoPoint;
  heading?: number;
}

export interface MASCmdArray {
  cmd: MASCmd[];
}

export interface Thruster {
  name: string;
}

export interface PhysicsInterfaceParams {
  uri: string;
  thrusters: Thruster[];
}

export enum DomainType {
  Surface = 'SURFACE',
  Underwater = 'UNDERWATER',
  Aerial = 'AERIAL',
}

export interface PhysicsDomainConfig {
  domain: DomainType;
  interfaceType: string;
  interfaceParams: PhysicsInterfaceParams;
}

export interface PhysicsInterface {
  initDomain: DomainType;
  domains: PhysicsDomainConfig[];
}

export interface RenderInterface {
  enabled: boolean;
  rendererType: string;
  publishRender?: boolean;
}

export interface WaypointFollowerInterface {
  enabled: boolean;
  loop: boolean;
  linearAccelLimit: number;
  angularAccelLimit: number;
  angularVelLimit: number;
  mode: string;
  waypoints?: { lat: number; lng: number }[];
  line?: { direction: number; length: number };
  circle?: { radius: number };
}

export class Agent {
  name: string;
  model: string;
  position: GeoPoint;
  heading: number;
  physicsInterface?: PhysicsInterface;
  renderInterface?: RenderInterface;
  waypointInterface?: WaypointFollowerInterface;

  constructor(data: {
    name: string;
    model: string;
    position: GeoPoint;
    heading: number;
    physicsInterface?: PhysicsInterface;
    renderInterface?: RenderInterface;
    waypointInterface?: WaypointFollowerInterface;
  }) {
    this.name = data.name;
    this.model = data.model;
    this.position = data.position;
    this.heading = data.heading;
    this.physicsInterface = data.physicsInterface;
    this.renderInterface = data.renderInterface;
    this.waypointInterface = data.waypointInterface;
  }

  static from(data: {
    name: string;
    model: string;
    position: GeoPoint;
    heading: number;
    physicsInterface?: PhysicsInterface;
    renderInterface?: RenderInterface;
    waypointInterface?: WaypointFollowerInterface;
  }): Agent {
    return new Agent(data);
  }

  generateLotusParamXML(): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    let renderPart = '';
    if (this.renderInterface?.enabled) {
      renderPart = `
      <render_interface>
        <publish_render>${this.renderInterface.publishRender ?? false}</publish_render>
        <renderer_type_name>${esc(this.renderInterface.rendererType)}</renderer_type_name>
      </render_interface>`;
    }

    let physicsPart = '';
    const domains = this.physicsInterface?.domains ?? [];
    if (this.physicsInterface && domains.length > 0) {
      const parts = domains.map((dc) => {
        const mode = dc.domain.toLowerCase();
        const thrusters = (dc.interfaceParams?.thrusters ?? [])
          .map((t, i) => `        <thrusters${i + 1}>${esc(t.name)}</thrusters${i + 1}>`)
          .join('\n');
        return `
        <${mode}>
          <InterfaceType>${esc(dc.interfaceType)}</InterfaceType>
          <uri>${esc(dc.interfaceParams?.uri ?? '')}</uri>
          <thrusters>
    ${thrusters}
          </thrusters>
        </${mode}>`;
      }).join('');
      const initState = this.physicsInterface.initDomain
        ? this.physicsInterface.initDomain.charAt(0) + this.physicsInterface.initDomain.slice(1).toLowerCase()
        : '';
      physicsPart = `
      <physics_engine_interface>${parts}
        <init_state>${esc(initState)}</init_state>
      </physics_engine_interface>`;
    }

    let waypointPart = '';
    const wf = this.waypointInterface;
    if (wf?.enabled) {
      const limits = `
      <loop>${wf.loop}</loop>
      <linear_acceleration_limit>${wf.linearAccelLimit}</linear_acceleration_limit>
      <angular_acceleration_limit>${wf.angularAccelLimit}</angular_acceleration_limit>
      <angular_velocity_limit>${wf.angularVelLimit}</angular_velocity_limit>
    `;
      let follower = '';
      if (wf.mode === 'waypoints' && (wf.waypoints?.length ?? 0) > 0) {
        const wps = wf.waypoints!.map((wp) => `<waypoint>${wp.lat} ${wp.lng}</waypoint>`).join('');
        follower = `<follower>${limits}<waypoints>${wps}</waypoints></follower>`;
      } else if (wf.mode === 'line' && wf.line) {
        follower = `<follower>${limits}<line><direction>${wf.line.direction}</direction><length>${wf.line.length}</length></line></follower>`;
      } else if (wf.mode === 'circle' && wf.circle) {
        follower = `<follower>${limits}<circle><radius>${wf.circle.radius}</radius></circle></follower>`;
      }
      waypointPart = `
      <waypoint_follower>
        ${follower}
      </waypoint_follower>`;
    }

    return `<lotus_param>${renderPart}${physicsPart}${waypointPart}</lotus_param>`
      .replace(/[\n\r\t]/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }
}

// Main scenario structure
export interface Scenario {
  filename?: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  tags?: string[];
  agents: Map<string, Agent>;
  timeOfDay: string;
  date: string;
  referencePosition: GeoPoint;
}
