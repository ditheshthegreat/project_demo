// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'inklusio-api',
    script: './packages/api/dist/app/server.js',
    instances: 2,  // Number of instances (use 'max' for all CPU cores)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
