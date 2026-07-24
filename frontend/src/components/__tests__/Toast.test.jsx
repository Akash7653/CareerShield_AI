import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Toast from '../Toast';

describe('Toast', () => {
  it('does not render when show is false', () => {
    render(<Toast toast={{ show: false, msg: 'Test message', sub: 'Subtitle', icon: '🛡️' }} />);
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('renders when show is true', () => {
    render(<Toast toast={{ show: true, msg: 'Test message', sub: 'Subtitle', icon: '🛡️' }} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('displays the correct icon', () => {
    render(<Toast toast={{ show: true, msg: 'Test message', sub: 'Subtitle', icon: '🦉' }} />);
    expect(screen.getByText('🦉')).toBeInTheDocument();
  });

  it('renders without subtitle when sub is empty', () => {
    render(<Toast toast={{ show: true, msg: 'Test message', sub: '', icon: '🛡️' }} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
