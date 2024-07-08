

module.exports = {
    list: [
        {
            path: 'schoolId',
            model: 'objectId',
            required: true,
        },
    ],
    create: [
        {
            path: 'name',
            model: 'text',
            required: true,
        },
        {
            path: 'schoolId',
            model: 'objectId',
            required: true,
        },
        // schedule
        {
            path: 'schedule.day',
            model: 'day',
            required: true,
        },
        {
            path: 'schedule.startTime',
            model: 'time',
            required: true,
        },
        {
            path: 'schedule.endTime',
            model: 'time',
            required: true,
        }
    ],
    delete: [
        {
            path: 'classroomId',
            model: 'objectId',
            required: true,
        },
    ],
    enroll: [
        {
            path: 'studentId',
            model: 'objectId',
            required: true,
        },
        {
            path: 'classroomId',
            model: 'objectId',
            required: true,
        },
    ],
}

