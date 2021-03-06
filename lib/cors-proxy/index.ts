const CorsAnywhere = require('cors-anywhere')

const host = process.env.CORS_PROXY_HOST || '0.0.0.0';
const port = process.env.CORS_PROXY_PORT || 9998;
let started = false

export function startCorsProxy() {
  if (!started) {
    started = true
    CorsAnywhere.createServer({
      originWhitelist: [], // Allow all origins
      requireHeader: ['origin', 'x-requested-with'],
      removeHeaders: []
    }).listen(port, host, function() {
      console.log('Running CORS Anywhere on ' + host + ':' + port);
    })
  }
}
