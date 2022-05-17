const deps = require('./package.json').dependencies;

module.exports = {
  name: 'game',
  library: { type: 'var', name: 'game' },
  shared: {
    ...deps,
    react: {
      singleton: true,
      requiredVersion: deps['react'],
    },
    'react-dom': {
      singleton: true,
      requiredVersion: deps['react-dom'],
    },
  },
};
