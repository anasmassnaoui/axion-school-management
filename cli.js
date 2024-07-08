const config = require('./config/index.config.js');
const ManagersLoader = require('./loaders/ManagersLoader.js');

async function create(argv) {
    if (argv.length < 1) {
        console.log('usage: create:\n\tsuperadmin email name password')
    } else {
        if (argv[0] === 'superadmin') {
            if (argv.length < 4) {
                console.log('usage: create superadmin email name password')
            } else {
                const mongoDB = config.dotEnv.MONGO_URI ? require('./connect/mongo')({
                    uri: config.dotEnv.MONGO_URI
                }) : null;                
                const managersLoader = new ManagersLoader({ config });
                const managers = managersLoader.load();
                const [_, email, name, password] = argv;
                const result = await managers.user.create({ email, name, password, role: 'superadmin' })
                if (result.error) {
                    console.error(`\x1b[31msuperadmin with email ${email} already exists`);
                } else {
                    console.log(`\x1b[32msuperadmin with email ${email} created successfuly`);
                }
                process.exit(0);
            }
        } else {
            console.log('cli: create: unknow command')
        }
    }
}

async function main(argv) {
    if (argv.length < 1) {
        console.log('usage:\n\tstart\n\tcreate command arg1 arg2 ...')
    } else if (argv[0] === 'create') {
        await create(argv.slice(1));
    } else if (argv[0] === 'start') {
        require('./index.js');
    } else {
        console.log('cli: unknow command')
    }
}

main(process.argv.slice(2));