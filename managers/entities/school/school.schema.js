

module.exports = {
    create: [
        {
            path: 'name',
            model: 'text',
            required: true,
        },
        // address
        {
            path: 'address.street',
            model: 'text',
            required: true,
        },
        {
            path: 'address.city',
            model: 'text',
            required: true,
        },
        {
            path: 'address.state',
            model: 'text',
            required: true,
        },
        {
            path: 'address.country',
            model: 'text',
            required: true,
        },
        // contactInfo
        {
            path: 'contactInfo.email',
            model: 'email',
            required: true,
        },
        {
            path: 'contactInfo.phone',
            model: 'phone',
        },
        {
            path: 'contactInfo.website',
            model: 'text',
        },
    ],
    delete: [
        {
            path: 'schoolId',
            model: 'objectId',
            required: true,
        },
    ],
    enroll: [
        {
            path: 'adminId',
            model: 'objectId',
            required: true,
        },
        {
            path: 'schoolId',
            model: 'objectId',
            required: true,
        },
    ],
}

