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
import { render, screen, fireEvent } from '@testing-library/react';
import SideBar from './Sidebar';
import { VesselPosition } from '../../types';

vi.mock('../../services/api', () => ({
  getAddress: () => ({ ip: 'localhost', port: 5000 }),
  saveAddress: vi.fn(),
  saveInstance: vi.fn(),
  startScenario: vi.fn().mockResolvedValue(true),
  stopScenario: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ showError: vi.fn() }),
}));

const defaultProps = {
  scenarios: ['scenario-a', 'scenario-b'],
  instances: ['lotusim'],
  selectedInstance: 'lotusim',
  setSelectedInstance: vi.fn(),
  vesselPositions: new Map<string, VesselPosition>(),
  onFlyTo: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('SideBar – vessel list', () => {
  it('shows "No vessels active" when map is empty', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.getByText('No vessels active')).toBeInTheDocument();
  });

  it('renders vessel name and formatted coordinates', () => {
    const vessels = new Map<string, VesselPosition>([
      ['usv_1', { vesselName: 'usv_1', geoPoint: { latitude: 1.23456, longitude: 103.98765, altitude: 0 } }],
    ]);
    render(<SideBar {...defaultProps} vesselPositions={vessels} />);
    expect(screen.getByText('usv_1')).toBeInTheDocument();
    expect(screen.getByText('1.23456, 103.98765')).toBeInTheDocument();
  });

  it('shows "Position unavailable" for vessels without geoPoint', () => {
    const vessels = new Map<string, VesselPosition>([
      ['ghost', { vesselName: 'ghost' }],
    ]);
    render(<SideBar {...defaultProps} vesselPositions={vessels} />);
    expect(screen.getByText('ghost')).toBeInTheDocument();
    expect(screen.getByText('Position unavailable')).toBeInTheDocument();
  });

  it('calls onFlyTo with [lat, lng] when coordinates are clicked', () => {
    const onFlyTo = vi.fn();
    const vessels = new Map<string, VesselPosition>([
      ['usv_1', { vesselName: 'usv_1', geoPoint: { latitude: 1.2, longitude: 103.8, altitude: 0 } }],
    ]);
    render(<SideBar {...defaultProps} vesselPositions={vessels} onFlyTo={onFlyTo} />);
    fireEvent.click(screen.getByText('1.20000, 103.80000'));
    expect(onFlyTo).toHaveBeenCalledWith([1.2, 103.8]);
  });

  it('renders multiple vessels', () => {
    const vessels = new Map<string, VesselPosition>([
      ['usv_1', { vesselName: 'usv_1', geoPoint: { latitude: 1.0, longitude: 103.0, altitude: 0 } }],
      ['usv_2', { vesselName: 'usv_2', geoPoint: { latitude: 2.0, longitude: 104.0, altitude: 0 } }],
    ]);
    render(<SideBar {...defaultProps} vesselPositions={vessels} />);
    expect(screen.getByText('usv_1')).toBeInTheDocument();
    expect(screen.getByText('usv_2')).toBeInTheDocument();
  });
});

describe('SideBar – environment field removed', () => {
  it('does not render an Environment field', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.queryByLabelText(/environment/i)).toBeNull();
    expect(screen.queryByText(/environment/i)).toBeNull();
  });
});

describe('SideBar – existing controls', () => {
  it('renders instance dropdown with the selected value', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.getByText('lotusim')).toBeInTheDocument();
  });

  it('renders "Launch Scenario" button', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Launch Scenario' })).toBeInTheDocument();
  });

  it('renders "Clear Simulation" button', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Clear Simulation' })).toBeInTheDocument();
  });

  it('renders instance dropdown label', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.getByLabelText('Instance Selected')).toBeInTheDocument();
  });
});
