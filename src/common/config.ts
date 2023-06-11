export const serverBase = '/srv'
export const endPoints = {
  hello: `${serverBase}/hello`,
  inventory: `${serverBase}/inventory`,
  uploads: `${serverBase}/uploads`
}

export const imgExtensions = new Set<string>(['jpg', 'png', 'gif'])
