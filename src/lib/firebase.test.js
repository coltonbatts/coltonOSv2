import { describe, it, expect } from 'vitest';
import * as firebase from './firebase';

describe('firebase module', () => {
    it('exports required firebase functions', () => {
        expect(firebase.auth).toBeDefined();
        expect(firebase.db).toBeDefined();
        expect(firebase.signInAnonymously).toBeDefined();
        expect(firebase.onAuthStateChanged).toBeDefined();
        expect(firebase.collection).toBeDefined();
        expect(firebase.addDoc).toBeDefined();
        expect(firebase.onSnapshot).toBeDefined();
    });
});
