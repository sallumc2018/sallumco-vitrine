const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../../06-conteudo/catalogo/catalogo_unificado.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const CLASSIFY_KEYWORDS = {
  "Casa": ["casa", "cozinha", "decoracao", "moveis", "sofa", "mesa", "cadeira", "estante", "armario", "coberta", "tapete", "almofada", "cortina", "toalha", "panela", "prato", "copo", "xicara", "utensilio", "organizador", "luminaria", "abajur", "vaso", "quadro", "espelho", "baba", "pet", "cachorro", "gato", "racao", "brinquedo", "fralda", "infantil", "berco", "carrinho", "mamadeira", "chuva", "guarda", "sapato", "bolsa", "mochila", "balanca", "pote", "hermetico", "marmita", "frigideira", "prateleira", "suporte", "porta", "sabonete", "dispenser", "garrafa", "cantil", "squeeze", "lancheira", "cadeado", "escada", "banco", "poltrona", "rede", "balde", "lixeira", "cesto", "mixer", "liquidificador", "cozedor", "ovos", "vapor", "silicone", "antiaderente", "vassoura", "pia", "torneira", "cafe", "coador", "inox", "filtro", "mop", "spray", "refil", "microfibra", "reservatorio", "ralador", "legumes", "fatiador", "rack", "aluminio", "dourado", "mini", "portatil", "shaker", "garrafa termica", "thermo", "jogo talheres", "escovao", "detergente", "esponja", "alcool", "limpador", "desinfetante", "lanterna", "pilha", "carne", "churrasco", "churrasqueira", "facas"],
  "Roupas e Acessorios": ["roupa", "camisa", "camiseta", "blusa", "calca", "calça", "short", "bermuda", "vestido", "saia", "jaqueta", "casaco", "moletom", "pijama", "cueca", "meia", "bone", "chapeu", "chapéu", "acessorio", "cinto", "oculos", "relogio", "pulseira", "anel", "brinco", "colar", "mochila", "bolsa", "tenis", "sapato", "chinelo", "bota", "fivela", "cano", "zip", "slip", "sapatilha", "ortopedico", "esportivo", "termica", "peluciada", "manga", "longa", "roupao", "robe", "pashmina", "ecobag", "impermeavel", "blusao", "sueter", "cardigan", "colete", "jeans", "legging", "corta-vento", "rock saints", "flamengo", "uniforme", "chuteira", "bermudao", "bucket", "hat"],
  "Bem-estar": ["massagem", "massageador", "pistola", "yoga", "fitness", "exercicio", "academia", "relaxamento", "aroma", "vitamina", "suplemento", "cosmetico", "skincare", "hidratante", "protetor", "shampoo", "condicionador", "perfume", "maquiagem", "unha", "cabelo", "barba", "barbeador", "escova", "pente", "creatina", "whey", "proteina", "monohidratada", "halter", "elastico", "glicemia", "glicose", "termometro", "nebulizador", "inalador", "repelente", "higiene", "orelha", "dormir", "sono", "estresse", "ansiedade", "creme", "locao", "tonico capilar", "omega 3", "oleo de peixe", "castanha", "nuts", "facial", "colageno", "sobrancelha", "barbear", "aparador", "pelos", "pressão arterial", "bioimpedancia", "saude", "abs", "abdomen", "barriga", "faixa elastica", "peso"],
  "Copa do Mundo": ["copa", "mundo", "2026", "brasil", "selecao", "verde", "amarelo", "azul", "bandeira", "futebol", "torcedor", "rabiola", "faixa decorativa", "vibes", "bucket", "chapéu", "chapeu", "hat", "copo termico", "personalizado", "abridor", "gol", "champions", "estadio", "campeao", "taca", "pele", "neymar", "copa do mundo"],
  "Tecnologia": ["celular", "smartphone", "carregador", "cabo", "fone", "ouvido", "caixa som", "bluetooth", "wi-fi", "wifi", "roteador", "computador", "notebook", "mouse", "teclado", "monitor", "webcam", "microfone", "hdmi", "usb", "memoria", "ssd", "gadget", "smart", "digital", "camera", "drone", "medidor pressao", "repetidor", "sinal", "antena", "alarme", "sensor", "tomada", "adaptador", "hub", "led", "lampada", "controle remoto", "fechadura", "catraca", "roleta", "credencial", "cadeado digital", "inteligente", "braco", "tecnologia", "eletronico", "portatil"],
  "Mamãe e Papai": ["mamae", "papai", "mae", "pai", "gestante", "gravida", "maternidade", "enxoval", "bebe conforto", "cadeira alimentacao", "mamadeira", "chupeta", "fralda", "babador", "brinquedo infantil", "infantil", "kids", "crianca", "talheres silicone", "ventosa", "colher", "garfo", "nebulizador portatil", "mini inalador", "bebe"],
  "Cama, mesa e banho": ["lençol", "lenco", "fronha", "toalha banho", "travesseiro", "colcha", "edredom", "cobertor", "cobre", "jogo de cama", "jogo de banho", "pluma", "ganso", "anticaro", "algodão", "secagem", "micropercal", "400 fios", "edredom", "cobre leito"]
};

function classify(name) {
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let bestCat = 'Outros';
  let bestScore = 0;
  for (const [cat, words] of Object.entries(CLASSIFY_KEYWORDS)) {
    let score = 0;
    for (const w of words) {
      if (normalized.includes(w)) score += (w.includes(' ') ? 2 : 1);
    }
    if (score > bestScore) { bestScore = score; bestCat = cat; }
  }
  return bestCat;
}

const categories = {};
for (const p of catalog.produtos) {
  const cat = classify(p.name);
  if (!categories[cat]) categories[cat] = [];
  categories[cat].push({ name: p.name, link: p.link, image: `https://cf.shopee.com.br/file/${p.itemId}_1000w.jpg`, price: null });
}

const categoryOrder = ["Casa", "Roupas e Acessórios", "Bem-estar", "Copa do Mundo", "Tecnologia", "Cama, mesa e banho", "Mamãe e Papai", "Outros"];
const output = {
  categories: categoryOrder.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), products: categories[name] || [] }))
};

fs.writeFileSync(path.resolve(__dirname, '../src/data/catalogo.json'), JSON.stringify(output, null, 2));
console.log(`Built: ${output.categories.reduce((s,c) => s + c.products.length, 0)} products`);