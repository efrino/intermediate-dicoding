import {
    getStoryById
} from '../../data/api';

export class DetailModel {
    async fetchStoryById(id) {
        return await getStoryById(id);
    }
}