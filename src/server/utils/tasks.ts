function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isJSON(value: unknown): boolean {
  try {
    JSON.parse(value as string)
    return true
  } catch (error) {
    return false
  }
}

const Tasks = {
  isString,
  isJSON,
}

export default Tasks
