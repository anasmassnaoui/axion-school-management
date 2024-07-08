

module.exports = class SchoolManager {

    constructor({ config, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.managers = managers;
        this.httpExposed = ['get=v1_list', 'v1_create', 'v1_delete', 'v1_enrollAdmin', 'v1_unenrollAdmin'];
    }

    /**
     * Endpoint: /v1_list
     * Description: This function retrieves a list of schools. It filters the schools based on the user's role,
     *              returning only the schools managed by the admin if the user role is 'admin'.
     * @returns schools: array - A list of schools with their names, contact information, and addresses.
     */
    async v1_list({ __token, __admin }) {
        const { userRole, userId } = __token;
        const filter = {};
        if (userRole === 'admin') {
            filter.admins = userId
        }
        const schools = await this.mongomodels.school.find(filter, 'name contactInfo address');
        return { schools };
    }

    /**
     * Endpoint: /v1_create
     * Description: This function creates a new school. It takes the name, address, and contact information for the new school,
     *              and then creates the school record in the database.
     * @param name: string The name of the new school.
     * @param address: { street:string, city:string, state:string, country:string } The address of the new school.
     * @param contactInfo: { email:string, phone?:string, website?:string } The contact information for the new school.
     * @returns school: object - The created school object with its ID, name, contact information, and address.
     */
    async v1_create({ __token, __superadmin, __validateCreateSchool, name, address, contactInfo }) {
        const school = { name, address, contactInfo }
        const createdSchool = await this.mongomodels.school.create(school);

        return {
            school: {
                _id: createdSchool._id,
                name: createdSchool.name,
                contactInfo: createdSchool.contactInfo,
                address: createdSchool.address,
            }
        }
    }

    /**
     * Endpoint: /v1_delete
     * Description: This function deletes a school. It first checks if the school exists, and then deletes all associated classrooms and students.
     *              Finally, it removes the school record from the database.
     * @param schoolId: string The unique identifier of the school to be deleted.
     */
    async v1_delete({ __token, __superadmin, __validateDeleteSchool, schoolId }) {
        const school = await this.mongomodels.school.findOne({ _id: schoolId });
        if (!school) {
            return { error: 'school not found.' }
        }

        const [isClassroomsDeleted, isStudentsDeleted, { deletedCount }] = await Promise.all([
            this.managers.classroom.deleteBySchoolId(schoolId),
            this.managers.user.deleteByIds(school.students),
            this.mongomodels.school.deleteOne({ _id: schoolId }),
        ])

        const error = isClassroomsDeleted.error || isStudentsDeleted.error;
        if (error) {
            return { error }
        } else if (deletedCount <= 0) {
            return { error: "couldn't delete school" };
        }
    }

    /**
     * Description: This function checks if an admin can be enrolled in a specified school. 
     *              It verifies the existence of the admin and the school, and ensures the admin's role is correct.
     */
    async validateEnrolling({ adminId, schoolId }) {
        const [admin, school] = await Promise.all([
            this.mongomodels.user.findOne({ _id: adminId }),
            this.mongomodels.school.findOne({ _id: schoolId }),
        ]);

        if (!admin) {
            return { error: 'admin not found.' }
        } else if (admin.role !== 'admin') {
            return { error: 'adminId must be an id of school admin user.' }
        } else if (!school) {
            return { error: 'school not found.' }
        }

        return { admin, school };
    }

    /**
     * Endpoint: /v1_enrollAdmin
     * Description: This function enrolls an admin in a specified school. It validates the enrollment conditions,
     *              checks if the admin is already enrolled, and then updates the school to include the admin.
     * @param adminId: string The unique identifier of the admin to be enrolled.
     * @param schoolId: string The unique identifier of the school.
     */
    async v1_enrollAdmin({ __token, __superadmin, __validateEnrollSchool, adminId, schoolId }) {
        const { error, school } = await this.validateEnrolling({ adminId, schoolId });
        if (error) {
            return { error }
        }

        if (school.admins.includes(adminId)) {
            return { error: 'admin already enrolled to school' }
        }

        const update = await this.mongomodels.school.updateOne({ _id: schoolId }, { $addToSet: { admins: adminId } })
        if (update.nModified <= 0) {
            return { error: "couldn't enroll admin to school" }
        }
    }

    /**
     * Endpoint: /v1_unenrollAdmin
     * Description: This function unenrolls an admin from a specified school. It validates the enrollment conditions,
     *              checks if the admin is currently enrolled, and then updates the school to remove the admin.
     * @param adminId: string The unique identifier of the admin to be unenrolled.
     * @param schoolId: string The unique identifier of the school.
     */
    async v1_unenrollAdmin({ __token, __superadmin, __validateEnrollSchool, adminId, schoolId }) {
        const { error, errors, school } = await this.validateEnrolling({ adminId, schoolId });
        if (error || errors) {
            return { error, errors }
        }

        if (!school.admins.includes(adminId)) {
            return { error: 'admin not enrolled to school' }
        }

        const update = await this.mongomodels.school.updateOne({ _id: schoolId }, { $pull: { admins: adminId } })
        if (update.nModified <= 0) {
            return { error: "couldn't unenroll admin from school" }
        }
    }

    /**
     * Description: This function checks if a school admin has access to a specified school. 
     *              It verifies the user's role and whether they are listed as an admin for the school.
     * @param schoolId: string The unique identifier of the school.
     */
    async hasAccess({ __token, schoolId }) {
        const { userId, userRole } = __token
        const filter = { _id: schoolId }
        if (userRole === 'admin') filter.admins = userId
        if (userRole === 'student') filter.students = userId
        const hasAccess = await this.mongomodels.school.exists(filter);
        if (!hasAccess) {
            return { error: 'unauthorized' }
        }
        return {}
    }

    async hasAccessByStudentId({ __token, studentId }) {
        const { userId, userRole } = __token
        const filter = { students: studentId }
        if (userRole === 'admin') filter.admins = userId
        const hasAccess = await this.mongomodels.school.exists(filter);
        if (!hasAccess) {
            return { error: 'unauthorized' }
        }
        return {}
    }

    async getById(schoolId) {
        const school = await this.mongomodels.school.findOne({ _id: schoolId });
        return school;
    }

    async addStudent({ schoolId, studentId }) {
        const update = await this.mongomodels.school.updateOne({ _id: schoolId }, { $addToSet: { students: studentId } })
        if (update.nModified <= 0) {
            return { error: "couldn't add student to school" }
        }
        return {}
    }

    async removeStudentById(studentId) {
        const update = await this.mongomodels.school.updateOne({ students: studentId }, { $pull: { students: studentId } })
        if (update.nModified <= 0) {
            return { error: "couldn't remove student from school" }
        }
        return {}
    }
}
