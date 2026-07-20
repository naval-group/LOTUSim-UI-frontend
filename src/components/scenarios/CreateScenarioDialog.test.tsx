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
import userEvent from '@testing-library/user-event';
import { CreateScenarioDialog } from './CreateScenarioDialog';

const onClose = vi.fn();
const onCreate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

function renderDialog(open = true) {
  return render(<CreateScenarioDialog open={open} onClose={onClose} onCreate={onCreate} />);
}

describe('CreateScenarioDialog', () => {
  it('renders when open', () => {
    renderDialog();
    expect(screen.getByText('New Scenario')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    renderDialog(false);
    expect(screen.queryByText('New Scenario')).not.toBeInTheDocument();
  });

  it('Create Scenario button is disabled when name is empty', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: 'Create Scenario' })).toBeDisabled();
  });

  it('Create Scenario button enables when name is filled', async () => {
    renderDialog();
    await userEvent.type(screen.getByLabelText(/Scenario Name/i), 'my-scenario');
    expect(screen.getByRole('button', { name: 'Create Scenario' })).toBeEnabled();
  });

  it('calls onCreate with correct fields on submit', async () => {
    renderDialog();
    await userEvent.type(screen.getByLabelText(/Scenario Name/i), 'alpha');
    await userEvent.type(screen.getByLabelText(/Author/i), 'test');
    fireEvent.click(screen.getByRole('button', { name: 'Create Scenario' }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'alpha', author: 'test' })
    );
  });

  it('calls onClose and resets fields when Cancel is clicked', async () => {
    renderDialog();
    await userEvent.type(screen.getByLabelText(/Scenario Name/i), 'temp');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('submits on Enter when name is filled', async () => {
    renderDialog();
    const input = screen.getByLabelText(/Scenario Name/i);
    await userEvent.type(input, 'beta');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'beta' }));
  });

  it('does not submit on Enter when name is empty', () => {
    renderDialog();
    const input = screen.getByLabelText(/Scenario Name/i);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreate).not.toHaveBeenCalled();
  });
});
