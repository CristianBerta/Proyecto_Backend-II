class UserRepository {
    constructor(userDao) {
        this.userDao = userDao;
    }

    async createUser(userData) {
        return await this.userDao.createUser(userData);
    }

    async getUserByEmail(email) {
        return await this.userDao.getUserByEmail(email);
    }

    async getUserById(id) {
        return await this.userDao.getUserById(id);
    }
}

export default UserRepository;