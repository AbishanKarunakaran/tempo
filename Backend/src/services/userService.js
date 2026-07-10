import userRepository from '../repositories/userRepository.js';

class UserService {
    async registerUser(preferredLanguage) {
        return await userRepository.createUser(preferredLanguage);
    }

    async getUserInfo(userId) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        return user;
    }
}

export default new UserService();
