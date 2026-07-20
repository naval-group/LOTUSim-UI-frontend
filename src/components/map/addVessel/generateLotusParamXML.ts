/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { Thruster } from '../../../types';

export type PhysicsMode = 'aerial' | 'surface' | 'underwater';

export interface PhysicsModeConfig {
  interfaceType: string;
  uri: string;
  thrusters: Thruster[];
}

export type PhysicsConfig = Record<PhysicsMode, PhysicsModeConfig>;
export type PhysicsModes = Record<PhysicsMode, boolean>;

export interface WaypointFollowerState {
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

const escapeXml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function generateLotusParamXML(params: {
  plugins: { 'physics engine': boolean; 'rendering engine': boolean };
  rendererType: string;
  publishRender: boolean;
  physicsModes: PhysicsModes;
  physicsConfig: PhysicsConfig;
  initState: string;
  waypointFollower: WaypointFollowerState;
}): string {
  const { plugins, rendererType, publishRender, physicsModes, physicsConfig, initState, waypointFollower } = params;

  let renderInterface = '';
  if (plugins['rendering engine']) {
    renderInterface = `
      <render_interface>
        <publish_render>${publishRender}</publish_render>
        <renderer_type_name>${escapeXml(rendererType)}</renderer_type_name>
      </render_interface>`;
  }

  let physicsEngineInterface = '';
  if (plugins['physics engine']) {
    const physicsParts = (Object.entries(physicsModes) as [PhysicsMode, boolean][])
      .filter(([, enabled]) => enabled)
      .map(([mode]) => {
        const config = physicsConfig[mode];
        const thrusters = config.thrusters
          .map(
            (t, idx) =>
              `        <thrusters${idx + 1}>${escapeXml(t.name)}</thrusters${idx + 1}>`
          )
          .join('\n');
        return `
        <${mode}>
          <InterfaceType>${escapeXml(config.interfaceType)}</InterfaceType>
          <uri>${escapeXml(config.uri)}</uri>
          <thrusters>
    ${thrusters}
          </thrusters>
        </${mode}>`;
      })
      .join('');

    physicsEngineInterface = `
      <physics_engine_interface>${physicsParts}
        <init_state>${escapeXml(initState)}</init_state>
      </physics_engine_interface>`;
  }

  let waypointFollowerInterface = '';
  if (waypointFollower.enabled) {
    const commonLimits = `
      <loop>${waypointFollower.loop}</loop>
      <linear_acceleration_limit>${waypointFollower.linearAccelLimit}</linear_acceleration_limit>
      <angular_acceleration_limit>${waypointFollower.angularAccelLimit}</angular_acceleration_limit>
      <angular_velocity_limit>${waypointFollower.angularVelLimit}</angular_velocity_limit>
    `;
    const followers: string[] = [];

    if (waypointFollower.mode === 'waypoints' && (waypointFollower.waypoints?.length ?? 0) > 0) {
      const waypointsXml = waypointFollower.waypoints!
        .map((wp) => `<waypoint>${wp.lat} ${wp.lng}</waypoint>`)
        .join('');
      followers.push(`
        <follower>
          ${commonLimits}
          <waypoints>${waypointsXml}</waypoints>
        </follower>`);
    }

    if (waypointFollower.mode === 'line' && waypointFollower.line) {
      followers.push(`
        <follower>
          ${commonLimits}
          <line>
            <direction>${waypointFollower.line.direction}</direction>
            <length>${waypointFollower.line.length}</length>
          </line>
        </follower>`);
    }

    if (waypointFollower.mode === 'circle' && waypointFollower.circle) {
      followers.push(`
        <follower>
          ${commonLimits}
          <circle>
            <radius>${waypointFollower.circle.radius}</radius>
          </circle>
        </follower>`);
    }

    waypointFollowerInterface = `
      <waypoint_follower>
        ${followers.join('')}
      </waypoint_follower>`;
  }

  return `<lotus_param>${renderInterface}${physicsEngineInterface}${waypointFollowerInterface}</lotus_param>`
    .replace(/[\n\r\t]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}
