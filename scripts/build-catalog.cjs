const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const sourcePath = path.resolve(root, '../06-conteudo/catalogo/catalogo_unificado.json')
const outputPath = path.resolve(root, 'src/data/catalogo.json')
const checkOnly = process.argv.includes('--check')
const VIDEO_ONLY_INDICES = new Set([249, 275, 372, 583])

const CATEGORY_KEYWORDS = {
  'Casa': ['casa', 'cozinha', 'decoracao', 'moveis', 'mesa', 'cadeira', 'armario', 'tapete', 'panela', 'utensilio', 'organizador', 'luminaria', 'garrafa', 'marmita', 'liquidificador', 'torneira', 'filtro', 'mop', 'churrasco'],
  'Roupas e Acessorios': ['roupa', 'camisa', 'camiseta', 'blusa', 'calca', 'short', 'vestido', 'jaqueta', 'casaco', 'moletom', 'meia', 'bone', 'chapeu', 'oculos', 'relogio', 'bolsa', 'tenis', 'sapato', 'chinelo', 'bota'],
  'Bem-estar': ['massagem', 'fitness', 'exercicio', 'academia', 'skincare', 'hidratante', 'protetor', 'shampoo', 'perfume', 'maquiagem', 'cabelo', 'barba', 'creatina', 'whey', 'termometro', 'higiene', 'colageno', 'saude'],
  'Copa do Mundo': ['copa', 'mundo', '2026', 'brasil', 'selecao', 'verde', 'amarelo', 'futebol', 'torcedor', 'estadio'],
  'Tecnologia': ['celular', 'smartphone', 'carregador', 'cabo', 'fone', 'bluetooth', 'wifi', 'notebook', 'mouse', 'teclado', 'monitor', 'webcam', 'microfone', 'hdmi', 'usb', 'camera', 'smart', 'sensor', 'tomada', 'led'],
  'Mamae e Papai': ['mamae', 'papai', 'mae', 'pai', 'gestante', 'maternidade', 'bebe', 'fralda', 'babador', 'infantil', 'crianca', 'nebulizador'],
  'Cama, mesa e banho': ['lencol', 'fronha', 'toalha', 'travesseiro', 'colcha', 'edredom', 'cobertor', 'jogo de cama', 'algodao'],
}

const CATEGORY_LABELS = {
  'Casa': 'Casa',
  'Roupas e Acessorios': 'Roupas e Acessorios',
  'Bem-estar': 'Bem-estar',
  'Copa do Mundo': 'Copa do Mundo',
  'Tecnologia': 'Tecnologia',
  'Cama, mesa e banho': 'Cama, mesa e banho',
  'Mamae e Papai': 'Mamae e Papai',
  'Outros': 'Outros',
}

const CATEGORY_ORDER = [
  'Casa',
  'Roupas e Acessorios',
  'Bem-estar',
  'Copa do Mundo',
  'Tecnologia',
  'Cama, mesa e banho',
  'Mamae e Papai',
  'Outros',
]

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function classify(name) {
  const normalized = normalizeText(name)
  let bestCategory = 'Outros'
  let bestScore = 0

  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const word of words) {
      if (normalized.includes(normalizeText(word))) {
        score += word.includes(' ') ? 2 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  return bestCategory
}

function readSourceCatalog() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Catalogo fonte nao encontrado: ${sourcePath}`)
  }

  const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
  if (!Array.isArray(data.produtos)) {
    throw new Error('Catalogo fonte invalido: esperado objeto com array "produtos".')
  }

  return data.produtos
}

function normalizeProduct(product, index) {
  const id = String(product.id || product.itemId || '').trim()
  const name = String(product.nome || product.name || '').trim()
  const link = String(product.link_afiliado || product.link || '').trim()
  const category = product.categoria || classify(name)

  if (!id || !name || !link) return null
  if (!/^https:\/\/(s\.)?shopee\.com\.br\//.test(link)) return null

  const normalized = {
    id,
    nome: name,
    name,
    link_afiliado: link,
    link,
    categoria: CATEGORY_LABELS[category] || 'Outros',
    image: product.image || `https://cf.shopee.com.br/file/${id}_1000w.jpg`,
    price: product.preco || product.price || null,
    discount: product.discount || null,
    sales: product.sales || product.vendas_texto || null,
  }

  if (VIDEO_ONLY_INDICES.has(index)) {
    normalized.videoOnly = true
    normalized.image = null
  }

  return normalized
}

function buildCatalog(products) {
  const categories = Object.fromEntries(CATEGORY_ORDER.map(category => [category, []]))

  for (const [index, rawProduct] of products.entries()) {
    const product = normalizeProduct(rawProduct, index)
    if (!product) continue

    const category = CATEGORY_LABELS[product.categoria] ? product.categoria : 'Outros'
    categories[category].push(product)
  }

  return {
    categories: CATEGORY_ORDER.map(name => ({
      name,
      slug: slugify(name),
      products: categories[name],
    })).filter(category => category.products.length > 0),
  }
}

function validatePublicCatalog(catalog) {
  const privateFields = new Set(['commission', 'comissao_texto', 'taxa_comissao'])
  const failures = []
  let count = 0

  for (const category of catalog.categories) {
    for (const product of category.products) {
      count += 1
      for (const field of Object.keys(product)) {
        if (privateFields.has(field)) failures.push(`${product.id}: campo privado ${field}`)
      }
      for (const required of ['id', 'nome', 'link_afiliado', 'categoria', 'name', 'link']) {
        if (!product[required]) failures.push(`${product.id || '(sem id)'}: campo obrigatorio ${required}`)
      }
    }
  }

  if (count === 0) failures.push('nenhum produto publico gerado')
  if (failures.length) {
    throw new Error(`Catalogo publico invalido:\n- ${failures.slice(0, 20).join('\n- ')}`)
  }

  return count
}

function validateCurrentCatalog(catalog) {
  if (!Array.isArray(catalog.categories)) {
    throw new Error('Catalogo da vitrine invalido: esperado array "categories".')
  }

  const privateFields = new Set(['commission', 'comissao_texto', 'taxa_comissao'])
  const failures = []
  let count = 0

  for (const category of catalog.categories) {
    if (!category.name || !category.slug || !Array.isArray(category.products)) {
      failures.push(`categoria invalida: ${category.name || '(sem nome)'}`)
      continue
    }

    for (const product of category.products) {
      count += 1
      for (const field of Object.keys(product)) {
        if (privateFields.has(field)) {
          failures.push(`${product.name || product.nome || '(sem nome)'}: campo privado ${field}`)
        }
      }
      if (!product.name && !product.nome) failures.push('produto sem nome')
      if (!product.link && !product.link_afiliado) failures.push(`${product.name || product.nome || '(sem nome)'}: produto sem link`)
    }
  }

  if (count === 0) failures.push('nenhum produto encontrado no catalogo atual')
  if (failures.length) {
    throw new Error(`Catalogo atual invalido:\n- ${failures.slice(0, 20).join('\n- ')}`)
  }

  return count
}

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Catalogo da vitrine nao encontrado: ${outputPath}`)
  }
  const currentCatalog = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  const currentCount = validateCurrentCatalog(currentCatalog)
  console.log(`[catalog:check] OK: ${currentCount} produtos publicos.`)
} else {
  const catalog = buildCatalog(readSourceCatalog())
  const count = validatePublicCatalog(catalog)
  const serialized = `${JSON.stringify(catalog, null, 2)}\n`

  fs.writeFileSync(outputPath, serialized)
  console.log(`[catalog:build] OK: ${count} produtos publicos em ${path.relative(root, outputPath)}.`)
}
