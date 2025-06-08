import { addStory, addStoryGuest } from '../../data/api';
import { getUserData } from '../../utils';
import Idb from '../../utils/idb';

export default class AddModel {
  async addStory(formData) {
    const user = getUserData();
    const isLoggedIn = user && user.token;
    const isOnline = navigator.onLine;

    // Konversi FormData ke object cloneable
    const plainData = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        plainData[key] = {
          name: value.name,
          type: value.type,
          lastModified: value.lastModified,
          blob: await value.arrayBuffer(), // simpan sebagai ArrayBuffer
        };
      } else {
        plainData[key] = value;
      }
    }

    if (isOnline) {
      try {
        return isLoggedIn
          ? await addStory(formData)
          : await addStoryGuest(formData);
      } catch (error) {
        console.error("Gagal kirim online, simpan offline:", error);
        await Idb.addPendingStory({ data: plainData, isLoggedIn });
        return {
          offline: true,
          message: "Cerita disimpan sementara, akan dikirim saat online.",
        };
      }
    } else {
      await Idb.addPendingStory({ data: plainData, isLoggedIn });
      return {
        offline: true,
        message: "Sedang offline, cerita disimpan sementara.",
      };
    }
  }
}
