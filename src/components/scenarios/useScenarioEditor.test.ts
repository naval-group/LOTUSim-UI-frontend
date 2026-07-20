/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScenarioEditor } from './useScenarioEditor';
import * as api from '../../services/api';

vi.mock('../../services/api');
const mockedApi = vi.mocked(api);

const mockScenario = {
  filename: 'test-scenario',
  name: 'Test Scenario',
  description: 'A test scenario.',
  version: '1.0',
  author: 'tester',
  tags: ['test', 'unit'],
  timeOfDay: '12:00',
  date: '2024-01-01',
  referencePosition: { latitude: 1.24, longitude: 103.72, altitude: 0 },
  agents: new Map([
    ['vessel_1', { name: 'vessel_1', model: 'usv', position: { latitude: 1.24, longitude: 103.72, altitude: 0 }, heading: 45 }],
  ]),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useScenarioEditor — new scenario', () => {
  it('starts with empty agents and no loading', () => {
    const { result } = renderHook(() =>
      useScenarioEditor('my-scenario', { isNew: true })
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.agents.size).toBe(0);
  });

  it('uses initial values when provided', () => {
    const { result } = renderHook(() =>
      useScenarioEditor('my-scenario', {
        isNew: true,
        name: 'My Scenario',
        author: 'test',
        description: 'desc',
        version: '2.0',
        tags: ['alpha'],
      })
    );
    expect(result.current.filename).toBe('my-scenario');
    expect(result.current.name).toBe('My Scenario');
    expect(result.current.author).toBe('test');
    expect(result.current.description).toBe('desc');
    expect(result.current.version).toBe('2.0');
    expect(result.current.tags).toEqual(['alpha']);
  });

  it('defaults name to filename when no initial name is provided', () => {
    const { result } = renderHook(() =>
      useScenarioEditor('my-scenario', { isNew: true })
    );
    expect(result.current.filename).toBe('my-scenario');
    expect(result.current.name).toBe('my-scenario');
  });
});

describe('useScenarioEditor — existing scenario', () => {
  it('loads scenario data on mount', async () => {
    mockedApi.getScenario = vi.fn().mockResolvedValue(mockScenario);

    const { result } = renderHook(() => useScenarioEditor('test-scenario'));

    expect(result.current.loading).toBe(true);
    await act(async () => {});

    expect(mockedApi.getScenario).toHaveBeenCalledWith('test-scenario');
    expect(result.current.loading).toBe(false);
    expect(result.current.name).toBe('Test Scenario');
    expect(result.current.description).toBe('A test scenario.');
    expect(result.current.version).toBe('1.0');
    expect(result.current.author).toBe('tester');
    expect(result.current.tags).toEqual(['test', 'unit']);
    expect(result.current.agents.size).toBe(1);
  });

  it('sets error when load fails', async () => {
    mockedApi.getScenario = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useScenarioEditor('test-scenario'));
    await act(async () => {});

    expect(result.current.error).toBe('Failed to load scenario.');
    expect(result.current.loading).toBe(false);
  });

  it('decodes URI-encoded scenario name', () => {
    mockedApi.getScenario = vi.fn().mockResolvedValue(mockScenario);
    const { result } = renderHook(() => useScenarioEditor('test%20scenario'));
    expect(result.current.filename).toBe('test scenario');
  });

  it('keeps filename and name independent when they differ', async () => {
    const scenario = { ...mockScenario, filename: 'demo_scenario', name: 'Demo' };
    mockedApi.getScenario = vi.fn().mockResolvedValue(scenario);
    mockedApi.updateScenario = vi.fn().mockResolvedValue({ success: true, message: 'ok' });

    const { result } = renderHook(() => useScenarioEditor('demo_scenario'));
    await act(async () => {});

    expect(result.current.filename).toBe('demo_scenario');
    expect(result.current.name).toBe('Demo');

    await act(async () => { await result.current.save(); });
    expect(mockedApi.updateScenario).toHaveBeenCalledWith(
      'demo_scenario',
      expect.objectContaining({ name: 'Demo' })
    );
  });
});

describe('useScenarioEditor — addAgent', () => {
  it('adds an agent to the map', () => {
    const { result } = renderHook(() => useScenarioEditor('s', { isNew: true }));

    act(() => {
      result.current.addAgent(
        'usv',
        'vessel_2',
        { vesselName: 'vessel_2', geoPoint: { latitude: 1.3, longitude: 103.8, altitude: 0 }, heading: 90 },
        ''
      );
    });

    expect(result.current.agents.size).toBe(1);
    const agent = result.current.agents.get('vessel_2');
    expect(agent?.model).toBe('usv');
    expect(agent?.heading).toBe(90);
    expect(agent?.position.latitude).toBeCloseTo(1.3);
  });

  it('overwrites an existing agent with the same name', () => {
    const { result } = renderHook(() => useScenarioEditor('s', { isNew: true }));

    act(() => {
      result.current.addAgent('usv', 'vessel_1', { vesselName: 'vessel_1', geoPoint: { latitude: 1.0, longitude: 103.0, altitude: 0 }, heading: 0 }, '');
      result.current.addAgent('asv', 'vessel_1', { vesselName: 'vessel_1', geoPoint: { latitude: 2.0, longitude: 104.0, altitude: 0 }, heading: 10 }, '');
    });

    expect(result.current.agents.size).toBe(1);
    expect(result.current.agents.get('vessel_1')?.model).toBe('asv');
  });
});

describe('useScenarioEditor — deleteAgent', () => {
  it('removes an agent from the map', () => {
    const { result } = renderHook(() => useScenarioEditor('s', { isNew: true }));

    act(() => {
      result.current.addAgent('usv', 'vessel_1', { vesselName: 'vessel_1', geoPoint: { latitude: 1.0, longitude: 103.0, altitude: 0 }, heading: 0 }, '');
    });
    act(() => {
      result.current.deleteAgent('vessel_1');
    });

    expect(result.current.agents.size).toBe(0);
  });

  it('is a no-op for a name that does not exist', () => {
    const { result } = renderHook(() => useScenarioEditor('s', { isNew: true }));
    act(() => {
      result.current.deleteAgent('ghost');
    });
    expect(result.current.agents.size).toBe(0);
  });
});

describe('useScenarioEditor — save', () => {
  it('calls createScenario for a new unsaved scenario', async () => {
    mockedApi.createScenario = vi.fn().mockResolvedValue({ success: true, message: 'ok' });

    const { result } = renderHook(() => useScenarioEditor('new-scenario', { isNew: true }));

    await act(async () => {
      await result.current.save();
    });

    expect(mockedApi.createScenario).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'new-scenario' })
    );
  });

  it('calls updateScenario for an existing scenario', async () => {
    mockedApi.getScenario = vi.fn().mockResolvedValue(mockScenario);
    mockedApi.updateScenario = vi.fn().mockResolvedValue({ success: true, message: 'ok' });

    const { result } = renderHook(() => useScenarioEditor('test-scenario'));
    await act(async () => {});

    await act(async () => {
      await result.current.save();
    });

    expect(mockedApi.updateScenario).toHaveBeenCalledWith(
      'test-scenario',
      expect.objectContaining({ name: 'Test Scenario' })
    );
  });

  it('sets error when save fails', async () => {
    mockedApi.createScenario = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useScenarioEditor('new-scenario', { isNew: true }));

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.error).toBe('Failed to save scenario.');
  });

  it('serialises agents as a plain object in the payload', async () => {
    mockedApi.createScenario = vi.fn().mockResolvedValue({ success: true, message: 'ok' });

    const { result } = renderHook(() => useScenarioEditor('s', { isNew: true }));

    act(() => {
      result.current.addAgent('usv', 'v1', { vesselName: 'v1', geoPoint: { latitude: 1.0, longitude: 103.0, altitude: 0 }, heading: 0 }, '');
    });

    await act(async () => {
      await result.current.save();
    });

    const payload = (mockedApi.createScenario as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.agents).not.toBeInstanceOf(Map);
    expect(payload.agents.v1).toBeDefined();
  });
});
