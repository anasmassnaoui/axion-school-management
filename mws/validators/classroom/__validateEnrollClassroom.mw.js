module.exports = ({ meta, config, managers, validators }) => {
    return async ({ req, res, next }) => {
        let result = await validators.classroom.enroll(req.body);
        if (result) {
            return managers.responseDispatcher.dispatch(res, { ok: false, errors: result });
        }
        next();
    }
}