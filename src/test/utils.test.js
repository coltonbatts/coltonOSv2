import { describe, it, expect } from 'vitest';
import { formatDate, capitalize } from '../lib/utils';

describe('Utils', () => {
    it('formatDate formats date correctly', () => {
        const date = '2023-12-25T12:00:00Z'; // Use ISO string
        // Basic check for month and day presence
        const formatted = formatDate(date);
        expect(formatted).toContain('Dec');
        expect(formatted).toContain('25');
    });

    it('capitalize capitalizes first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('WORLD')).toBe('WORLD');
        expect(capitalize('')).toBe('');
    });
});
