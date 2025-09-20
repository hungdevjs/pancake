import rateLimit from 'express-rate-limit';

const limiter = (maxInOneSecond = 5) =>
  rateLimit({
    windowMs: 1 * 1_000,
    max: maxInOneSecond,
    keyGenerator: function (req) {
      return `${req.originalUrl}-${req.userId}`;
    },
    handler: function (req, res, next) {
      res.status(429).json({
        message: 'Too many requests, please try again later.',
      });
    },
  });

export default limiter;
