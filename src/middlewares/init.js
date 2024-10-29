export function init(req, res, next) {
  req.locals = {};
  next();
}
