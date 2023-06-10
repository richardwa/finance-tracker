import sha1 from 'sha1'
const fileRoot = '/fcgi-bin/crud.pl/money-manager-data'
export const getImageUrl = (name: string) => `${fileRoot}/uploads/${name}`
export const getThumbUrl = (name: string) =>
  `/fcgi-bin/thumb.pl/webdav-root/money-manager-data/uploads/${name}`

const getFile = <T>(
  path: string,
  f: (r: Response) => Promise<T>
): Promise<{ file: T; lastModified: string }> => {
  return fetch(`${fileRoot}/${path}`).then((r) => {
    const lastModified = r.headers.get('lastModified') as string
    return f(r).then((b) => ({
      file: b,
      lastModified
    }))
  })
}

export const getBinary = (path: string) => getFile(path, (r) => r.blob())
export const getText = (path: string) => getFile(path, (r) => r.text())
export const getJson = <T>(path: string) => getFile(path, (r) => r.json() as Promise<T>)
export const listFiles = async (path: string) => {
  const info = await getText(path)
  const dirs: string[] = []
  const files: string[] = []
  for (const f of info.file.split('\n')) {
    if (f.startsWith('f:')) {
      files.push(f.substring(2))
    } else {
      dirs.push(f.substring(2))
    }
  }
  return { files, dirs }
}

export const saveFile = async (
  path: string,
  data: string | Blob,
  version?: string
): Promise<boolean> => {
  const r = await fetch(`${fileRoot}/${path}`, {
    method: 'PUT',
    headers: {
      LastModified: version || ''
    },
    body: data
  })
  return r.status === 200
}

const textDecoder = new TextDecoder()
export const saveImage = async (...files: File[]): Promise<string[]> => {
  return Promise.all(
    files.map(async (s) => {
      const arrayBuffer = await s.arrayBuffer()
      const sha = sha1(textDecoder.decode(arrayBuffer))
      const ext = s.name?.split('.').pop() || 'png'
      const name = `${sha}.${ext}`
      return saveFile(`uploads/${name}`, s).then((b) => name)
    })
  )
}
