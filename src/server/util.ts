import * as fs from 'fs'
import * as path from 'path'

export function makeDirectoriesIfNotExist(dirPath: string): void {
  // Normalize the path
  const normalizedPath = path.normalize(dirPath)

  // Split the path into individual directories
  const directories = normalizedPath.split(path.sep)

  // Iterate over the directories and create them if they don't exist
  let currentPath = ''
  directories.forEach((directory) => {
    currentPath = path.join(currentPath, directory)
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath)
    }
  })
}
