import * as fs from 'fs'
import * as path from 'path'

export function makeDirectoriesIfNotExist(dirPath: string): void {
  const normalizedPath = path.normalize(dirPath)
  const directories = normalizedPath.split(path.sep)

  // Iterate over the directories and create them if they don't exist
  let currentPath = ''
  directories.forEach((directory) => {
    currentPath = path.join(currentPath, directory)
    if (!fs.existsSync(currentPath)) {
      try {
        fs.mkdirSync(currentPath)
      } catch (e) {
        console.log(e)
      }
    }
  })
}

export type DirectoryEntry = {
  name: string
  type: 'file' | 'directory'
}
export async function listDirectory(directoryPath: string): Promise<DirectoryEntry[]> {
  return new Promise<DirectoryEntry[]>((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, entries) => {
      if (err) {
        reject(err)
        return
      }

      const fileListing: DirectoryEntry[] = []

      for (const entry of entries) {
        const fileEntry: DirectoryEntry = {
          name: entry.name,
          type: entry.isFile() ? 'file' : 'directory'
        }

        fileListing.push(fileEntry)
      }

      resolve(fileListing)
    })
  })
}

export async function readFileContents(filename: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

export async function writeFileIfNotExists(filename: string, content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (!err) {
        // File already exists
        resolve()
        return
      }

      fs.writeFile(filename, content, (writeErr) => {
        if (writeErr) {
          reject(writeErr)
          return
        }
        console.log('wrote file', filename, content.length)
        resolve()
      })
    })
  })
}

export async function deleteFile(filename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(filename, (err) => {
      if (err) {
        reject(err)
        return
      }
      console.log('delete file', filename)
      resolve()
    })
  })
}
