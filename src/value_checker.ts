export function doesHaveValue<T>(value: T): boolean {
  return !doesNotHaveValue(value)
}

export function doesNotHaveValue<T>(value: T): boolean {
  return value == null
}

export function valueOrDefault<T>(value: T, defaultValue: T): T {
  if(doesHaveValue(value)) {
    return value
  }
  return defaultValue
}
