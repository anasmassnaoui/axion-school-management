const crypto = require('crypto');

function hashPassword(password, salt) {
    const derivedKey = crypto.scryptSync(
        password.toString().normalize(),
        salt.normalize(),
        64
    )
    return derivedKey.toString('hex');
}

module.exports = class UserManager {

    constructor({ config, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.httpExposed = ['v1_login'];
        this.salt = this.config.dotEnv.PASSWORD_SALT;
    }

    /**
     * Endpoint: /v1_login
     * Description: This function handles the login process for users. It verifies the user's credentials,
     *              and if the user is found, it generates a long-term authentication token.
     * @param email: string The email address of the user attempting to log in.
     * @param password: string The password associated with the user's email.
     * @returns longToken: string - A long-term authentication token provided to the user upon successful login.
     */
    async v1_login({ __validateLogin, email, password }) {
        
        const credentials = { email, password: hashPassword(password, this.salt) }
        const user = await this.mongomodels.user.findOne(credentials);
        if (!user) {
            return { error: 'email or password incorrect.' };
        }
        let longToken = this.tokenManager.genLongToken({ userId: user._id, userRole: user.role });

        return {
            longToken
        }
    }

    async findByIds(ids) {
        const users = await this.mongomodels.user.find({ _id: { $in: ids ?? [] } }, 'name email')
        return users;
    }

    async findByRole(role) {
        const users = this.mongomodels.user.find({ role }, 'name email');
        return users;
    }

    async findById(id) {
        const user = await this.mongomodels.user.findById(id, 'name email');
        return user;
    }

    async create({ name, email, password, role }) {
        const user = { name, email, password: hashPassword(password, this.salt), role }

        const exists = await this.mongomodels.user.exists({ email })
        if (exists) {
            return { error: `user with mail ${email} already exists` }
        }
        const createdUser = await this.mongomodels.user.create(user);

        return {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email
        }
    }

    async deleteById(userId) {
        const { deletedCount } = await this.mongomodels.user.deleteOne({ _id: userId });
        if (deletedCount <= 0) {
            return { error: "couldn't delete user" };
        }
        return {}
    }

    async deleteByIds(userIds) {
        await this.mongomodels.user.deleteMany({ _id: { $in: userIds } });
        return {}
    }
}
