module.exports = {
    apps: [{
        name: 'gms-seo-analyzer',
        script: 'node_modules/.bin/next',
        args: 'start',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
        },
    }],
};
