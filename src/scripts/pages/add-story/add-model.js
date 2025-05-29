import { addStory, addStoryGuest } from '../../data/api';
import { getUserData } from '../../utils';

export default class AddModel {
  async addStory(formData) {
    const user = getUserData();
    const isLoggedIn = user && user.token;
    return isLoggedIn ? await addStory(formData) : await addStoryGuest(formData);
  }
}
