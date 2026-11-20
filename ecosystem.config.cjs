module.exports = {
  apps: [
    {
      name: "thistle",
      cwd: __dirname,
      script: "npm",
      args: "run dev",
      autorestart: true,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
