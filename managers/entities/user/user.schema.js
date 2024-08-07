

module.exports = {
    login: [
        {
            path: 'email',
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
    ],
    listStudents: [
        {
            path: 'schoolId',
            model: 'objectId',
            required: true,
        },
    ],
    createAdmin: [
        {
            path: 'name',
            model: 'text',
            required: true,
        },
        {
            path: 'email',
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
    ],
    createStudent: [
        {
            path: 'schoolId',
            model: 'objectId',
            required: true,
        },
        {
            path: 'name',
            model: 'text',
            required: true,
        },
        {
            path: 'email',
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
    ],
    deleteAdmin: [
        {
            path: 'adminId',
            model: 'objectId',
            required: true,
        },
    ],
    deleteStudent: [
        {
            path: 'studentId',
            model: 'objectId',
            required: true,
        },
    ],
}


