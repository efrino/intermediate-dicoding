import { NotificationHelper } from '../../utils/notification-helper.js';
import AddModel from './add-model';

export default class AddPresenter {
  constructor(view) {
    this.view = view;
    this._model = new AddModel();
    this._init();
  }

  _init() {
    this.view.onSubmit(this._handleSubmitStory.bind(this));
  }

  async _handleSubmitStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);

    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const result = await this._model.addStory(formData);

    if (result.error) {
      console.error('Error submitting story:', result.message);
      throw new Error(result.message || 'Failed to add story');
    } else {
      NotificationHelper.showToast('Story added successfully');
      window.location.hash = '/stories';
    }

    return result;
  }
}
