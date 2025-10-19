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

export function isInteger(value: unknown): boolean {
  // Converte para número caso seja uma string
  const numberValue = typeof value === 'string' ? Number(value) : value

  return (
    typeof numberValue === 'number' &&
    Number.isInteger(numberValue) &&
    numberValue >= 0
  )
}

const Tasks = {
  isString,
  isJSON,
}

export default Tasks
