import { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from '../lib/firebase';

/**
 * Universal Firestore collection hook
 * Handles subscription, CRUD, loading states
 */
export function useCollection(uid, collectionName, orderField = 'createdAt') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const collectionPath = `users/${uid}/${collectionName}`;

  useEffect(() => {
    if (!uid || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, collectionPath),
      orderBy(orderField, 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, collectionPath, orderField]);

  const add = async (data) => {
    if (!uid || !db) return null;
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      console.error(`Error adding to ${collectionName}:`, err);
      setError(err);
      return null;
    }
  };

  const update = async (id, data) => {
    if (!uid || !db) return false;
    try {
      await updateDoc(doc(db, collectionPath, id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error(`Error updating ${collectionName}:`, err);
      setError(err);
      return false;
    }
  };

  const remove = async (id) => {
    if (!uid || !db) return false;
    try {
      await deleteDoc(doc(db, collectionPath, id));
      return true;
    } catch (err) {
      console.error(`Error deleting from ${collectionName}:`, err);
      setError(err);
      return false;
    }
  };

  return { items, loading, error, add, update, remove };
}

/**
 * Hook for single document (like scratchpad)
 */
export function useDocument(uid, collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const docPath = `users/${uid}/${collectionName}/${docId}`;

  useEffect(() => {
    if (!uid || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, docPath),
      (doc) => {
        if (doc.exists()) {
          setData(doc.data());
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching document:`, err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, docPath]);

  const save = async (newData) => {
    if (!uid || !db) return false;
    setSaving(true);
    try {
      const { setDoc } = await import('../lib/firebase');
      await setDoc(doc(db, docPath), {
        ...newData,
        updatedAt: new Date().toISOString()
      });
      setTimeout(() => setSaving(false), 500);
      return true;
    } catch (err) {
      console.error(`Error saving document:`, err);
      setSaving(false);
      return false;
    }
  };

  return { data, loading, saving, save };
}
