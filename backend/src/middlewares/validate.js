export function validate(schema, target = "body") {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[target]);

    if (!parsed.success) {
      next(parsed.error);
      return;
    }

    req.validated ??= {};
    req.validated[target] = parsed.data;

    if (target === "body") {
      req.body = parsed.data;
    }

    next();
  };
}
