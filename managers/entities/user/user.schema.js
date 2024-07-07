

module.exports = {
    createUser: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'userrole',
            required: true,
        },
        {
            model: 'password',
            required: false,
        }
    ],
}


