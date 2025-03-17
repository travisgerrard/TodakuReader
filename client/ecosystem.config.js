module.exports = {
  apps: [
    {
      name: 'todaku-client-dev',
      script: './start-port-3001.sh',
      watch: ['src'],
      ignore_watch: ['node_modules', 'build', 'logs'],
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/client-error.log',
      out_file: 'logs/client-out.log',
      merge_logs: true,
      instances: 1,
      max_restarts: 5,
      restart_delay: 10000,
      autorestart: true
    }
  ]
}; 