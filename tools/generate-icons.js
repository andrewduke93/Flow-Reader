/*
  Generate platform-optimized PNG icons and splash screens from the SVG source.
  Requires: sharp (devDependency). Run: npm run generate:assets
*/
const fs = require('fs')
const path = require('path')

const inDir = path.resolve(__dirname, '..', 'public', 'icons')
const outDir = inDir
const srcIcon = path.join(inDir, 'flowy-icon.svg')
const srcSplash = path.join(inDir, 'flowy-splash.svg')

async function ensureSharp(){
  try { return require('sharp') }
  catch (err) {
    console.error('\nMissing required package `sharp`.')
    console.error('Install with: npm i -D sharp')
    process.exit(1)
  }
}

const iconSizes = [48,72,96,128,144,152,192,384,512,1024]
const splashSizes = [
  {w:640,h:1136, name:'apple-splash-640-1136.png'},
  {w:750,h:1334, name:'apple-splash-750-1334.png'},
  {w:828,h:1792, name:'apple-splash-828-1792.png'},
  {w:1125,h:2436, name:'apple-splash-1125-2436.png'},
  {w:1242,h:2208, name:'apple-splash-1242-2208.png'},
  {w:1242,h:2688, name:'apple-splash-1242-2688.png'},
  {w:1536,h:2048, name:'apple-splash-1536-2048.png'},
  {w:1668,h:2224, name:'apple-splash-1668-2224.png'},
  {w:1668,h:2388, name:'apple-splash-1668-2388.png'},
  {w:2048,h:2732, name:'apple-splash-2048-2732.png'}
]

async function run(){
  const sharp = await ensureSharp()
  if (!fs.existsSync(srcIcon) || !fs.existsSync(srcSplash)) {
    console.error('SVG sources missing in public/icons — make sure flowy-icon.svg and flowy-splash.svg exist')
    process.exit(1)
  }

  console.log('Generating PNG icons...')
  for (const s of iconSizes){
    const out = path.join(outDir, `icon-${s}x${s}.png`)
    await sharp(srcIcon).resize(s, s).png({quality:90}).toFile(out)
    console.log('  wrote', out)
  }

  console.log('Generating splash images (iOS)...')
  for (const s of splashSizes){
    const out = path.join(outDir, s.name)
    await sharp(srcSplash).resize(s.w, s.h).png({quality:90}).toFile(out)
    console.log('  wrote', out)
  }

  // adaptive icon (maskable) — 432x432 recommended
  const maskOut = path.join(outDir, 'icon-maskable.png')
  await sharp(srcIcon).resize(432,432).png({quality:90}).toFile(maskOut)
  console.log('  wrote', maskOut)

  console.log('\nDone — generated icons and splash assets in public/icons.')
}

run().catch(err=>{ console.error(err); process.exit(1) })
