import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  listScenarios,
  createScenario,
  deleteScenario,
  getScenario,
  updateScenario,
  listModels,
  saveAddress,
  getAddress,
  saveInstance,
  getInstance,
} from './api';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('address helpers', () => {
  it('returns defaults when nothing is saved', () => {
    expect(getAddress()).toEqual({ ip: 'localhost', port: 5000 });
  });

  it('saves and retrieves address', () => {
    saveAddress('192.168.1.1', 8080);
    expect(getAddress()).toEqual({ ip: '192.168.1.1', port: 8080 });
  });

  it('saves and retrieves instance', () => {
    saveInstance('my-instance');
    expect(getInstance()).toBe('my-instance');
  });
});

describe('listScenarios', () => {
  it('returns scenario names on success', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: { success: true, count: 2, scenarios: ['alpha', 'beta'] },
    });
    const result = await listScenarios();
    expect(result).toEqual(['alpha', 'beta']);
  });

  it('returns empty array on error', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await listScenarios();
    expect(result).toEqual([]);
  });
});

describe('createScenario', () => {
  it('posts payload and returns response', async () => {
    const mockResponse = { success: true, message: 'created', scenario_id: 'abc' };
    mockedAxios.post = vi.fn().mockResolvedValue({ data: mockResponse });

    const result = await createScenario({ name: 'test-scenario' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/scenario'),
      { name: 'test-scenario' }
    );
    expect(result).toEqual(mockResponse);
  });

  it('returns null on error', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await createScenario({ name: 'test-scenario' });
    expect(result).toBeNull();
  });
});

describe('deleteScenario', () => {
  it('returns true on successful deletion', async () => {
    mockedAxios.delete = vi.fn().mockResolvedValue({ status: 200, data: { success: true } });
    const result = await deleteScenario('my-scenario');
    expect(result).toBe(true);
    expect(mockedAxios.delete).toHaveBeenCalledWith(expect.stringContaining('/scenario/my-scenario'));
  });

  it('returns false on error', async () => {
    mockedAxios.delete = vi.fn().mockRejectedValue(new Error('Not found'));
    const result = await deleteScenario('missing');
    expect(result).toBe(false);
  });
});

describe('getScenario', () => {
  it('returns a scenario with agents as a Map', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          name: 'test',
          timeOfDay: '12:00',
          date: '2024-01-01',
          referencePosition: { latitude: 1.0, longitude: 103.0, altitude: 0 },
          agents: {
            vessel_1: { name: 'vessel_1', model: 'usv', position: { latitude: 1.0, longitude: 103.0, altitude: 0 }, heading: 0 },
          },
        },
      },
    });

    const result = await getScenario('test');
    expect(result).not.toBeNull();
    expect(result!.agents).toBeInstanceOf(Map);
    expect(result!.agents.get('vessel_1')?.model).toBe('usv');
  });

  it('handles missing agents gracefully', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: { data: { name: 'empty', timeOfDay: '', date: '', referencePosition: null } },
    });
    const result = await getScenario('empty');
    expect(result!.agents).toBeInstanceOf(Map);
    expect(result!.agents.size).toBe(0);
  });

  it('returns null on error', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error('Not found'));
    const result = await getScenario('missing');
    expect(result).toBeNull();
  });
});

describe('updateScenario', () => {
  it('sends PUT and returns response', async () => {
    const mockResponse = { success: true, message: 'updated' };
    mockedAxios.put = vi.fn().mockResolvedValue({ data: mockResponse });

    const result = await updateScenario('my-scenario', { name: 'my-scenario' });
    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/scenario/my-scenario'),
      { name: 'my-scenario' }
    );
    expect(result).toEqual(mockResponse);
  });
});

describe('listModels', () => {
  it('returns model names on success', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: { success: true, count: 1, models: ['usv_model'] },
    });
    const result = await listModels();
    expect(result).toEqual(['usv_model']);
  });

  it('returns empty array on error', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await listModels();
    expect(result).toEqual([]);
  });
});
