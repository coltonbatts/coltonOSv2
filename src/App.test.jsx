import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock child components
vi.mock('./views/Dashboard', () => ({
    default: () => <div data-testid="dashboard">Dashboard View</div>
}));
vi.mock('./views/ProjectsView', () => ({
    default: () => <div data-testid="projects">Projects View</div>
}));
vi.mock('./views/VaultView', () => ({
    default: () => <div data-testid="vault">Vault View</div>
}));
vi.mock('./views/ScheduleView', () => ({
    default: () => <div data-testid="schedule">Schedule View</div>
}));
vi.mock('./components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}));
// Mock ToastProvider
vi.mock('./context/ToastContext', () => ({
    ToastProvider: ({ children }) => <div>{children}</div>
}));

describe('App', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('renders LoadingScreen initially', async () => {
        vi.doMock('./lib/firebase', () => ({
            auth: {},
            firebaseError: null,
            signInAnonymously: vi.fn(() => Promise.resolve()),
            onAuthStateChanged: vi.fn(() => () => { }),
        }));

        const { default: App } = await import('./App');
        render(<App />);
        expect(screen.getByText('Initializing System...')).toBeInTheDocument();
    });

    it('renders ErrorScreen on Firebase initialization error', async () => {
        vi.doMock('./lib/firebase', () => ({
            auth: null,
            firebaseError: { message: 'Mock Firebase Error' },
            signInAnonymously: vi.fn(),
            onAuthStateChanged: vi.fn(),
        }));

        const { default: App } = await import('./App');
        render(<App />);
        expect(screen.getByText('System Error')).toBeInTheDocument();
        expect(screen.getByText('Mock Firebase Error')).toBeInTheDocument();
    });

    it('renders Dashboard after authentication', async () => {
        vi.doMock('./lib/firebase', () => ({
            auth: { currentUser: { uid: '123' } },
            firebaseError: null,
            signInAnonymously: vi.fn(),
            onAuthStateChanged: vi.fn((auth, callback) => {
                callback({ uid: '123' });
                return () => { };
            }),
        }));

        const { default: App } = await import('./App');
        render(<App />);

        await waitFor(() => {
            expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        });
    });
});
