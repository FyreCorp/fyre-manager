module.exports = {
    apps: [{
        time: true,
        name: 'Fyre Manager',
        script: './build/app.js',
        node_args: '-r dotenv/config'
    }]
};
