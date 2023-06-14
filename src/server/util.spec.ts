import { listDirectory, readFileContents } from './util'
import { test, expect } from 'vitest'

test('listDirectory', () => {
  listDirectory('./').then((files) => {
    console.log(files)
    expect(files).toBeDefined()
  })
})

test('readFileContents', () => {
  readFileContents('index.html').then((contents) => {
    console.log(contents)
    expect(contents).toBeDefined()
  })
})
