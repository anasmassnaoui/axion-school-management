

module.exports = class ClassRoomManager {

    constructor({ config, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.managers = managers;
        this.httpExposed = ['get=v1_list', 'v1_create', 'v1_delete', 'v1_enrollStudent', 'v1_unenrollStudent'];
    }

    /**
     * Endpoint: /v1_list
     * Description: This function retrieves a list of classrooms for a specified school. It verifies the access rights
     *              of the user making the request and filters the classrooms based on the user's role.
     * @param schoolId: string The unique identifier of the school.
     * @returns classrooms: array - A list of classrooms with their names, schedules, and school IDs.
     */
    async v1_list({ __token, __validateListClassroom, schoolId }) {
        const { userId, userRole } = __token;
        const filter = { schoolId }
        const hasAccess = await this.managers.school.hasAccess({ __token, schoolId })
        if (hasAccess.error) {
            return { error: hasAccess.error }
        }
        if (userRole === 'student') filter.students = userId
        const classrooms = await this.mongomodels.classroom.find(filter, 'name schedule schoolId');

        return { classrooms };
    }

    /**
     * Endpoint: /v1_create
     * Description: This function creates a new classroom for a specified school. It verifies the admin's access rights,
     *              and if the admin has access, it creates the classroom with the given name and schedule.
     * @param schoolId: string The unique identifier of the school.
     * @param name: string The name of the new classroom.
     * @param schedule: { day:string, startTime:string, endTime:string } The schedule for the new classroom.
     * @returns classroom: object - The created classroom object with its ID, name, schedule, and school ID.
     */
    async v1_create({ __token, __admin, __validateCreateClassroom, schoolId, name, schedule }) {
        const hasAccess = await this.managers.school.hasAccess({ __token, schoolId })
        if (hasAccess.error) {
            return { error: hasAccess.error }
        }

        const classroom = { schoolId, name, schedule }
        const createdClassroom = await this.mongomodels.classroom.create(classroom);

        return {
            classroom: {
                _id: createdClassroom._id,
                name: createdClassroom.name,
                schedule: createdClassroom.schedule,
                schoolId: createdClassroom.schoolId,
            }
        }
    }

    /**
     * Endpoint: /v1_delete
     * Description: This function deletes a classroom. It first checks if the classroom exists and verifies the admin's access rights.
     *              If the classroom exists and the admin has the necessary access, it deletes the classroom.
     * @param classroomId: string The unique identifier of the classroom to be deleted.
     */
    async v1_delete({ __token, __admin, __validateDeleteClassroom, classroomId }) {
        const classroom = await this.mongomodels.classroom.findOne({ _id: classroomId });
        if (!classroom) {
            return { error: 'classroom not found.' }
        }

        const hasAccess = await this.managers.school.hasAccess({ __token, schoolId: classroom.schoolId })
        if (hasAccess.error) {
            return { error: hasAccess.error }
        }

        const { deletedCount } = await this.mongomodels.classroom.deleteOne({ _id: classroomId });
        if (deletedCount <= 0) {
            return { error: "couldn't delete classroom" };
        }
    }

    /**
     * Description: This function checks if a student can be enrolled in a specified classroom. It verifies the existence
     *              of the student, classroom, and school, and ensures the student's school matches the classroom's school.
     */
    async validateEnrollment({ __token, classroomId, studentId }) {
        const [student, classroom, school] = await Promise.all([
            this.mongomodels.user.findOne({ _id: studentId }),
            this.mongomodels.classroom.findOne({ _id: classroomId }),
            this.mongomodels.school.findOne({ students: studentId })
        ]);

        const { userId, userRole } = __token;

        if (!student) {
            return { error: 'student not found.' }
        } else if (student.role !== 'student') {
            return { error: 'studentId must be an id of school student user.' }
        } else if (!classroom) {
            return { error: 'classroom not found.' }
        } else if (!school) {
            return { error: 'student not registered to any school.' }
        } else if (classroom.schoolId !== school._id.toString()) {
            return { error: 'classroom not belong to user school.' }
        } else if (userRole === 'admin' && !school.admins.includes(userId)) {
            return { error: 'unauthorized.' }
        }

        return { student, classroom, school };
    }

    /**
     * Endpoint: /v1_enrollStudent
     * Description: This function enrolls a student in a specified classroom. It validates the enrollment conditions,
     *              checks if the student is already enrolled, and then updates the classroom to include the student.
     * @param classroomId: string The unique identifier of the classroom.
     * @param studentId: string The unique identifier of the student to be enrolled.
     */
    async v1_enrollStudent({ __token, __admin, __validateEnrollClassroom, classroomId, studentId }) {
        const { error, classroom } = await this.validateEnrollment({ __token, classroomId, studentId });
        if (error) {
            return { error }
        }

        if (classroom.students.includes(studentId)) {
            return { error: 'student already enrolled to classroom' }
        }

        const update = await this.mongomodels.classroom.updateOne({ _id: classroom }, { $addToSet: { students: studentId } })
        if (update.nModified <= 0) {
            return { error: "couldn't enroll student to classroom" }
        }
    }

    /**
     * Endpoint: /v1_unenrollStudent
     * Description: This function unenrolls a student from a specified classroom. It validates the enrollment conditions,
     *              checks if the student is currently enrolled, and then updates the classroom to remove the student.
     * @param classroomId: string The unique identifier of the classroom.
     * @param studentId: string The unique identifier of the student to be unenrolled.
     */
    async v1_unenrollStudent({ __token, __admin, __validateEnrollClassroom, classroomId, studentId }) {
        const { error, errors, classroom } = await this.validateEnrollment({ __token, classroomId, studentId });
        if (error || errors) {
            return { error, errors }
        }

        if (!classroom.students.includes(studentId)) {
            return { error: 'student already not enrolled to classroom' }
        }

        const update = await this.mongomodels.classroom.updateOne({ _id: classroom }, { $pull: { students: studentId } })
        if (update.nModified <= 0) {
            return { error: "couldn't unenroll student from classroom" }
        }
    }

    async unEnrollStudentById(studentId) {
        const update = await this.mongomodels.classroom.updateOne({ students: studentId }, { $pull: { students: studentId } })
        if (update.nModified <= 0) {
            return { error: "couldn't remove student from classroom" }
        }
        return {}
    }

    async deleteBySchoolId(schoolId) {
        await this.mongomodels.classroom.deleteMany({ schoolId })
        return {};
    }
}
