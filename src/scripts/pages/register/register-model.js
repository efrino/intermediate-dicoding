import {
    registerUser
} from '../../data/api';

export class RegisterModel {
    async register(name, email, password) {
        try {
            return await registerUser(name, email, password);
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }
}