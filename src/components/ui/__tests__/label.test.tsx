import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';
import { Input } from '../input';

describe('Label', () => {
  it('renders with children', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" />
      </>
    );

    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Label</Label>);
    expect(screen.getByText('Label')).toHaveClass('custom-class');
  });

  it('applies default styling classes', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('text-sm', 'font-medium');
  });

  it('renders as a label element', () => {
    const { container } = render(<Label>Label</Label>);
    expect(container.querySelector('label')).toBeInTheDocument();
  });
});
