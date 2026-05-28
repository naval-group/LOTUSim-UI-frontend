import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioCard } from './ScenarioCard';

const onClick = vi.fn();
const onDelete = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('ScenarioCard', () => {
  it('renders the scenario name', () => {
    render(<ScenarioCard name="my-scenario" onClick={onClick} onDelete={onDelete} />);
    expect(screen.getByText('my-scenario')).toBeInTheDocument();
  });

  it('calls onClick with name when card is clicked', () => {
    render(<ScenarioCard name="my-scenario" onClick={onClick} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('my-scenario'));
    expect(onClick).toHaveBeenCalledWith('my-scenario');
  });

  it('calls onDelete with name after confirm', () => {
    render(<ScenarioCard name="my-scenario" onClick={onClick} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete scenario' }));
    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('my-scenario');
  });

  it('does not call onDelete when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ScenarioCard name="my-scenario" onClick={onClick} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete scenario' }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('delete click does not trigger onClick', () => {
    render(<ScenarioCard name="my-scenario" onClick={onClick} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete scenario' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
