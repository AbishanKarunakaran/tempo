import userService from '../services/userService.js';

export const registerUser = async (req, res) => {
    try {
        const userId = await userService.registerUser(req.body.preferred_language);
        res.status(201).json({ message: 'User registered', userId: userId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
};

export const getUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserInfo(id);
        res.status(200).json(user);
    } catch (error) {
        if (error.status === 404) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
};
