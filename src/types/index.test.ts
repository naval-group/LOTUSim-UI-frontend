/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { describe, it, expect } from 'vitest';

import { Agent, DomainType, wrapHeading } from './index';

const baseData = {
  name: 'lrauv_0',
  model: 'lrauv',
  position: { latitude: 1.26, longitude: 103.75, altitude: -30 },
  heading: 90,
};

describe('Agent', () => {
  it('keeps the position and heading it is given', () => {
    const agent = Agent.from(baseData);
    expect(agent.position).toEqual(baseData.position);
    expect(agent.heading).toBe(90);
  });

  it('keeps zeros as values (equator, North, sea level)', () => {
    const agent = new Agent({
      ...baseData,
      position: { latitude: 0, longitude: 0, altitude: 0 },
      heading: 0,
    });
    expect(agent.position).toEqual({ latitude: 0, longitude: 0, altitude: 0 });
    expect(agent.heading).toBe(0);
  });
});

describe('Agent.generateLotusParamXML', () => {
  it('returns an empty lotus_param without interfaces', () => {
    expect(Agent.from(baseData).generateLotusParamXML()).toBe('<lotus_param></lotus_param>');
  });

  it('writes the render interface when enabled', () => {
    const xml = Agent.from({
      ...baseData,
      renderInterface: { enabled: true, rendererType: 'lrauv', publishRender: true },
    }).generateLotusParamXML();
    expect(xml).toContain('<publish_render>true</publish_render>');
    expect(xml).toContain('<renderer_type_name>lrauv</renderer_type_name>');
  });

  it('omits the render interface when disabled', () => {
    const xml = Agent.from({
      ...baseData,
      renderInterface: { enabled: false, rendererType: 'lrauv' },
    }).generateLotusParamXML();
    expect(xml).not.toContain('render_interface');
  });

  it('escapes XML special characters', () => {
    const xml = Agent.from({
      ...baseData,
      renderInterface: { enabled: true, rendererType: `a<b&"c` },
    }).generateLotusParamXML();
    expect(xml).toContain('a&lt;b&amp;&quot;c');
  });

  it('writes the physics interface and the initial state', () => {
    const xml = Agent.from({
      ...baseData,
      physicsInterface: {
        initDomain: DomainType.Underwater,
        domains: [
          {
            domain: DomainType.Underwater,
            interfaceType: 'XDynWebSocket',
            interfaceParams: { uri: 'ws://127.0.0.1:12346', thrusters: [{ name: 'propeller' }] },
          },
        ],
      },
    }).generateLotusParamXML();
    expect(xml).toContain('<underwater>');
    expect(xml).toContain('<InterfaceType>XDynWebSocket</InterfaceType>');
    expect(xml).toContain('<uri>ws://127.0.0.1:12346</uri>');
    expect(xml).toContain('<thrusters1>propeller</thrusters1>');
    expect(xml).toContain('<init_state>Underwater</init_state>');
  });

  it('writes waypoints as "lat lng"', () => {
    const xml = Agent.from({
      ...baseData,
      waypointInterface: {
        enabled: true,
        loop: true,
        linearAccelLimit: 1,
        angularAccelLimit: 2,
        angularVelLimit: 3,
        mode: 'waypoints',
        waypoints: [{ lat: 1.5, lng: 103.5 }],
      },
    }).generateLotusParamXML();
    expect(xml).toContain('<loop>true</loop>');
    expect(xml).toContain('<waypoint>1.5 103.5</waypoint>');
  });
});

describe('wrapHeading', () => {
  it.each([
    [0, 0],
    [90, 90],
    [360, 0],
    [-90, 270],
    [725, 5],
    [359.5, 359.5],
  ])('wraps %d to %d', (input, expected) => {
    expect(wrapHeading(input)).toBe(expected);
  });
});
