import {
    loginUser
} from '../../data/api';
import {
    saveUserData
} from '../../utils';

export class LoginModel {
    async login(email, password) {
        const result = await loginUser(email, password);
        if (!result.error) {
            const {
                name,
                token
            } = result.loginResult;

            saveUserData({
                name,
                token
            });

            return {
                name,
                token
            };
        } else {
            throw new Error(result.message);
        }
    }
}