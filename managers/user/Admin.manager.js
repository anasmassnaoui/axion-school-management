

module.exports = class Admin {

    constructor({ config, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.userManager = managers.user;
        this.httpExposed = ['get=v1_list', 'v1_create', 'v1_delete'];
    }

    /**
     * Endpoint: /v1_list
     * Description: This function retrieves a list of school administrators. It fetches all users with the role 'admin' 
     *              and returns their names and email addresses.
     * @returns admins: array - A list of school administrators with their names and email addresses.
     */
    async v1_list({ __token, __superadmin }) {
        const admins = await this.userManager.findByRole('admin');
        return { admins };
    }

    /**
     * Endpoint: /v1_create
     * Description: This function creates a new school administrator. It takes the name, email, and password of the new admin,
     *              assigns them the role of 'admin', and creates the user.
     * @param name: string The name of the new school administrator.
     * @param email: string The email address of the new school administrator.
     * @param password: string The password for the new school administrator's account.
     * @returns admin: object - The created school administrator object.
     */
    async v1_create({ __token, __superadmin, __validateCreateAdmin, name, email, password }) {
        const createdAadmin = await this.userManager.create({ name, email, password, role: 'admin' })
        return {
            admin: createdAadmin
        };
    }

    /**
     * Endpoint: /v1_delete
     * Description: This function deletes a school administrator. It takes the ID of the school admin to be deleted 
     *              and removes them from the system.
     * @param adminId: string The unique identifier of the school administrator to be deleted.
     */
    async v1_delete({ __token, __superadmin, __validateDeleteAdmin, adminId }) {
        const { error } = await this.userManager.deleteById(adminId)
        if (error) {
            return { error }
        }
    }
}
