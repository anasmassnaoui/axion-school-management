module.exports = ({ meta, config, managers, validators }) => {
    return async ({ req, res, next, results }) => {
        let result = await validators.user.login(req.body);
        if (result) {
            return managers.responseDispatcher.dispatch(res, { ok: false, errors: result });
        }
        next();
    }
}