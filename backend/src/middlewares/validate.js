export function validate(schema, pick = "body") {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[pick])
      req[pick] = data
      next()
    } catch (e) {
      const issues = e?.issues?.map((i) => ({ path: i.path.join("."), message: i.message }))
      return res.status(422).json({ success: false, message: "Validation failed", details: issues })
    }
  }
}

