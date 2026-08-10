import * as esbuild from 'esbuild'
import { mkdirSync } from 'node:fs'

mkdirSync('api', { recursive: true })

await esbuild.build({
  entryPoints: ['server/chat.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/chat.js',
  logLevel: 'info',
})

console.log('Bundled serverless API → api/chat.js')
