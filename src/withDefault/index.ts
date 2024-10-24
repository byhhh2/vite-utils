const withDefault = (
  object: Record<string, unknown>,
  defaultObject: Record<string, unknown>
) => {
  const result = {...object}

  for (const key in defaultObject) {
    result[key] ??= defaultObject[key]
  }

  return result
}

export default withDefault
