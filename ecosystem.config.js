module.exports = {
  apps: [
    {
      name: "gestion-luminarias",
      cwd: "/var/www/gestion-luminarias",
      script: "npm",
      args: "run start -- -p 3002",
      env: { NODE_ENV: "production" },
    },
  ],
};
