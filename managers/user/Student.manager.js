

module.exports = class StudentManager {

    constructor({ config, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.userManager = managers.user;
        this.classroomManager = managers.classroom;
        this.schoolManager = managers.school;
        this.httpExposed = ['get=v1_list', 'v1_create', 'v1_delete'];
    }

    /**
     * Endpoint: /v1_list
     * Description: This function retrieves a list of students for a specified school.
     *              It verifies the access rights of the admin making the request,
     *              ensures the school exists, and then fetches the list of students
     *              associated with that school.
     * @param schoolId: string The unique identifier of the school.
     * @returns students: array - A list of students associated with the specified school.
     */
    async v1_list({ __token, __admin, __validateListStudent, schoolId }) {
        const hasAccess = await this.schoolManager.hasAccess({ __token, schoolId })
        if (hasAccess.error) {
            return { error: hasAccess.error }
        }

        const school = await this.schoolManager.getById(schoolId);
        if (!school) {
            return { error: "school not found." }
        }

        const students = await this.userManager.findByIds(school.students);

        return { students }
    }

    /**
     * Endpoint: /v1_create
     * Description: This function creates a new student for a specified school.
     *              It verifies the access rights of the admin making the request,
     *              creates the student, and adds the student to the school.
     * @param schoolId: string The unique identifier of the school.
     * @param name: string The name of the student.
     * @param email: string The email address of the student.
     * @param password: string The password for the student's account.
     * @returns student: object - The created student object.
     */
    async v1_create({ __token, __admin, __validateCreateStudent, schoolId, name, email, password }) {
        const hasAccess = await this.schoolManager.hasAccess({ __token, schoolId })
        if (hasAccess.error) {
            return { error: hasAccess.error }
        }

        const createdStudent = await this.userManager.create({ name, email, password, role: 'student' });
        if (createdStudent.error) {
            return { error: createdStudent.error }
        }
        const addStudentResult = await this.schoolManager.addStudent({ studentId: createdStudent._id, schoolId });
        if (addStudentResult.error) {
            return { error: addStudentResult.error }
        }

        return {
            student: createdStudent
        }
    }

    /**
     * Endpoint: /v1_delete
     * Description: This function deletes a student and removes them from all associated entities
     *              (school and classroom). It ensures the student is deleted from the user database,
     *              removed from the school, and removed from any associated classrooms.
     * @param studentId: string The unique identifier of the student to be deleted.
     */
    async v1_delete({ __token, __admin, __validateDeleteStudent, studentId }) {
        const student = await this.userManager.findById(studentId);
        if (!student) {
            return { error: "student not found." }
        }

        const hasAccess = await this.schoolManager.hasAccessByStudentId({ __token, studentId })
        if (hasAccess.error) {
            return { error: hasAccess.error }
        }

        const [userDeleted, removedFromSchool, removedFromClassroom] = await Promise.all([
            this.userManager.deleteById(studentId),
            this.classroomManager.unEnrollStudentById(studentId),
            this.schoolManager.removeStudentById(studentId),
        ])

        const error = userDeleted.error || removedFromSchool.error || removedFromClassroom.error;

        if (error) {
            return { error }
        }
    }
}
