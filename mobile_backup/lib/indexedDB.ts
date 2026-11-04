export interface IDBMediaItem {
  id: string;
  type: 'video' | 'audio' | 'image';
  name: string;
  duration: number;
  blob: Blob;
  thumbnailUri?: string;
  timestamp: number;
}

const DB_NAME = 'NexusCutMediaDB';
const STORE_NAME = 'mediaAssets';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open IndexedDB");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveMediaToDB(item: IDBMediaItem): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllMediaFromDB(): Promise<IDBMediaItem[]> {
  if (typeof indexedDB === 'undefined') return [];
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by timestamp descending
      const items = (request.result as IDBMediaItem[]) || [];
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMediaFromDB(id: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
