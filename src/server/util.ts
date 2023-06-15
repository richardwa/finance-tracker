import { promises as fs } from 'fs'

export type DirectoryEntry = {
  name: string
  type: 'file' | 'directory'
}
export const listDirectory = (directoryPath: string): Promise<DirectoryEntry[]> =>
  fs
    .readdir(directoryPath, { withFileTypes: true })
    .then((files) => files.map((f) => ({ name: f.name, type: f.isFile() ? 'file' : 'directory' })))

export const readFileContents = (filePath: string) => fs.readFile(filePath, { encoding: 'utf-8' })

export const mkdirp = (directoryPath: string) => fs.mkdir(directoryPath, { recursive: true })
