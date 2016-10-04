
module.exports = {
    entry: './index.js',
    output: {
        path: './dist',
        library: 'wee_db',
        libraryTarget: 'umd',
        filename: 'wee-db.js'
    },
    module: {
        loaders: []
    },
    externals: {
        'lodash': '_'
    }
};
