const onResponseFinished = (req, res, start) => () => {
  const delta = Date.now() - start;
  const timestamp = new Date(start).toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const status = res.statusCode;
  console.log(`[${timestamp}] ${method} ${url} - ${status} (${delta} ms)`);
};

function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', onResponseFinished(req, res, start));
  next();
}

module.exports = logger;
