import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

type GradientSnapshot = {
  id: number
  preview: string
  name?: string
  favorite?: boolean
  kind?: 'saved' | 'history'
  width: number
  height: number
  colors: string[]
  pointPositions?: Array<{ x: number; y: number }>
  style: string
  warpShape: string
  warp: number
  warpSize: number
  noise: number
}

const DATA_DIR = path.join(process.cwd(), 'data')
const LIBRARY_FILE = path.join(DATA_DIR, 'gradient-library.json')

function isSnapshot(value: unknown): value is GradientSnapshot {
  const snapshot = value as Partial<GradientSnapshot>
  return (
    typeof snapshot.id === 'number' &&
    typeof snapshot.preview === 'string' &&
    (snapshot.name === undefined || typeof snapshot.name === 'string') &&
    (snapshot.favorite === undefined || typeof snapshot.favorite === 'boolean') &&
    (snapshot.kind === undefined || snapshot.kind === 'saved' || snapshot.kind === 'history') &&
    typeof snapshot.width === 'number' &&
    typeof snapshot.height === 'number' &&
    Array.isArray(snapshot.colors) &&
    snapshot.colors.every((color) => typeof color === 'string') &&
    (
      snapshot.pointPositions === undefined ||
      (
        Array.isArray(snapshot.pointPositions) &&
        snapshot.pointPositions.every((point) => typeof point?.x === 'number' && typeof point?.y === 'number')
      )
    ) &&
    typeof snapshot.style === 'string' &&
    typeof snapshot.warpShape === 'string' &&
    typeof snapshot.warp === 'number' &&
    typeof snapshot.warpSize === 'number' &&
    typeof snapshot.noise === 'number'
  )
}

async function readLibrary() {
  try {
    const content = await readFile(LIBRARY_FILE, 'utf8')
    const parsed: unknown = JSON.parse(content)
    return Array.isArray(parsed) ? parsed.filter(isSnapshot).slice(0, 18) : []
  } catch {
    return []
  }
}

export async function GET() {
  const library = await readLibrary()
  return NextResponse.json({ library })
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const library = Array.isArray(body) ? body.filter(isSnapshot).slice(0, 18) : []

  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(LIBRARY_FILE, `${JSON.stringify(library, null, 2)}\n`, 'utf8')

  return NextResponse.json({ library })
}
