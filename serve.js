const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith(path.sep) || req.url.endsWith('/')) p = path.join(p, 'index.html');
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',   // 本地调试：禁 HTTP 缓存，避免 SW/浏览器拿到旧构建
    });
    res.end(d);
  });
}).listen(8124, '127.0.0.1', () => console.log('serving http://127.0.0.1:8124'));
