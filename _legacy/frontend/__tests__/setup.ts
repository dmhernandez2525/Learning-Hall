import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.logoUrl which is used by components
Object.defineProperty(window, 'logoUrl', {
  value: '/test-logo.png',
  writable: true,
});

// Mock window.currentUser for session tests
Object.defineProperty(window, 'currentUser', {
  value: undefined,
  writable: true,
});

// Mock console methods to reduce noise in tests (optional)
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
