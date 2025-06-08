import { openDB } from 'idb';
import { addStory, addStoryGuest } from '../data/api';

const DB_NAME = 'dicoding-story-db';
const DB_VERSION = 2;
const STORE_NAME = 'stories';
const PENDING_STORE = 'pending-stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(PENDING_STORE)) {
            db.createObjectStore(PENDING_STORE, { keyPath: 'id', autoIncrement: true });
        }
    },
});

const Idb = {
    // Cerita untuk tampilan
    async putStories(stories) {
        const db = await dbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const story of stories) {
            tx.store.put(story);
        }
        await tx.done;
    },

    async getAllStories() {
        const db = await dbPromise;
        return db.getAll(STORE_NAME);
    },

    async clearAllStories() {
        const db = await dbPromise;
        return db.clear(STORE_NAME);
    },

    // Simpan cerita pending offline
    async addPendingStory(story) {
        const db = await dbPromise;
        return db.add(PENDING_STORE, story); // story: { data: {}, isLoggedIn: boolean }
    },

    async getPendingStories() {
        const db = await dbPromise;
        return db.getAll(PENDING_STORE);
    },

    async clearPendingStory(key) {
        const db = await dbPromise;
        return db.delete(PENDING_STORE, key);
    },

    async clearAllPendingStories() {
        const db = await dbPromise;
        return db.clear(PENDING_STORE);
    },

    // Kirim ulang semua cerita offline saat online
    // Kirim ulang semua cerita offline saat online
    async sendAllPendingStories() {
        const db = await dbPromise;
        const tx = db.transaction(PENDING_STORE, 'readwrite');
        const store = tx.objectStore(PENDING_STORE);

        const allItems = await store.getAll();
        const allKeys = await store.getAllKeys();

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            const key = allKeys[i]; // Dapatkan key asli

            const formData = new FormData();

            for (const [k, v] of Object.entries(item.data)) {
                if (v && v.blob) {
                    const blob = new Blob([v.blob], { type: v.type });
                    const file = new File([blob], v.name, {
                        type: v.type,
                        lastModified: v.lastModified,
                    });
                    formData.append(k, file);
                } else {
                    formData.append(k, v);
                }
            }

            try {
                if (item.isLoggedIn) {
                    await addStory(formData);
                } else {
                    await addStoryGuest(formData);
                }

                await store.delete(key); // Hapus menggunakan key valid dari getAllKeys
                console.log(`✅ Cerita "${formData.get('description')}" berhasil dikirim & dihapus dari pending.`);
            } catch (err) {
                console.error('❌ Gagal kirim ulang pending story:', err);
            }
        }

        await tx.done;
    }


};

export default Idb;
