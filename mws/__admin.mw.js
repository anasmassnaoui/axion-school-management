module.exports = ({ meta, config, managers }) => {
    return ({ req, res, next, results }) => {
        const { userRole } = results.__token ?? {}
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
        }
        next();
    }
}