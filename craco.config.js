const CracoLessPlugin = require('craco-less');

module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {
                            '@primary-color': '#0996ff',
                            '@background': '#e8e9eb',
                            '@money': '#f88510',

                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};