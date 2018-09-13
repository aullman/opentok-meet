module.exports = {
  devServer: {
    proxy: {
      "/user": {
        target: "http://localhost:3000/v1/",
        changeOrigin: true
      },
      "/v1": {
        target: "http://localhost:3000/",
        changeOrigin: true
      }
    }
  }
};
