import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const forbiddenPublicFiles = new Set([
  'audit.html',
  'image-review.html',
])
const forbiddenPatterns = [
  /\bcommission\b/i,
  /\bcomissao_texto\b/i,
  /taxa\s+de\s+comiss[aã]o/i,
  /comiss[aã]o\s+\d+(?:[,.]\d+)?\s*%/i,
]

const allowedDisclosurePatterns = [
  /podem gerar comiss[aã]o/i,
  /receber comiss[aã]o/i,
]

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else {
      files.push(fullPath)
    }
  }

  return files
}

function isTextAsset(filePath) {
  return /\.(html|js|json|css|txt|xml|svg)$/i.test(filePath)
}

function hasForbiddenCommissionLeak(contents) {
  const lines = contents.split(/\r?\n/)

  return lines.some(line => {
    const hasForbidden = forbiddenPatterns.some(pattern => pattern.test(line))
    if (!hasForbidden) return false

    return !allowedDisclosurePatterns.some(pattern => pattern.test(line))
  })
}

try {
  const info = await stat(distDir)
  if (!info.isDirectory()) {
    throw new Error('dist exists but is not a directory')
  }
} catch {
  console.error('[audit:public] dist/ not found. Run npm run build first.')
  process.exit(1)
}

const allFiles = await walk(distDir)
const forbiddenFiles = allFiles
  .map(filePath => path.relative(distDir, filePath))
  .filter(relativePath => forbiddenPublicFiles.has(relativePath))

if (forbiddenFiles.length > 0) {
  console.error('[audit:public] Review-only files found in public build:')
  for (const filePath of forbiddenFiles) console.error(`- ${filePath}`)
  process.exit(1)
}

const files = allFiles.filter(isTextAsset)
const leaks = []

for (const filePath of files) {
  const contents = await readFile(filePath, 'utf8')
  if (hasForbiddenCommissionLeak(contents)) {
    leaks.push(path.relative(root, filePath))
  }
}

if (leaks.length > 0) {
  console.error('[audit:public] Commission metadata leaked into public build:')
  for (const leak of leaks) console.error(`- ${leak}`)
  process.exit(1)
}

console.log(`[audit:public] OK: scanned ${files.length} public assets; no private commission metadata found.`)
