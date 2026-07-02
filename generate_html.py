import json
from pathlib import Path

with open('/home/sallumc/Documents/Omega/02-repos/06-afiliado-shopee/vitrine/src/data/catalogo.json') as f:
    catalog = json.load(f)

html = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vitrine SallumC</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: { shopee: "#ee4d2d" } } }
    }
  </script>
  <style>
    .category-tab { @apply px-3 py-1.5 text-sm font-medium rounded-full transition bg-gray-100 text-gray-700 border border-gray-200; }
    .category-tab.active { @apply bg-shopee text-white border-shopee; }
    .product-card { @apply bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden; }
    .btn-affiliate { @apply block w-full text-center px-3 py-2 bg-shopee text-white text-sm font-semibold rounded; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <header class="bg-shopee text-white px-4 py-5">
    <h1 class="text-2xl font-bold">Vitrine SallumC</h1>
    <p class="text-sm opacity-90">Produtos selecionados com carinho</p>
  </header>

  <nav id="categories" class="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b"></nav>

  <main id="products" class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"></main>

  <script>
    const catalog = ''' + json.dumps(catalog) + ''';
    let activeCat = catalog.categories[0].name;

    // Render tabs
    const tabs = document.getElementById('categories');
    catalog.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-tab' + (cat.name === activeCat ? ' active' : '');
      btn.textContent = cat.name;
      btn.onclick = () => { activeCat = cat.name; render(); };
      tabs.appendChild(btn);
    });

    // Render products
    const main = document.getElementById('products');
    function render() {
      const cat = catalog.categories.find(c => c.name === activeCat);
      main.innerHTML = cat.products.map(p => `
        <div class="product-card">
          <img src="${p.image}" alt="${p.name}" class="w-full h-40 object-cover" onerror="this.src='https://placehold.co/400x400'">
          <div class="p-2">
            <p class="text-xs line-clamp-2 mb-2">${p.name}</p>
            <a href="${p.link}" target="_blank" class="btn-affiliate">Ver na Shopee</a>
          </div>
        </div>
      `).join('');
      document.querySelectorAll('.category-tab').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
    }
    render();
  </script>
</body>
</html>'''

Path('/home/sallumc/Documents/Omega/02-repos/06-afiliado-shopee/vitrine/dist/index.html').parent.mkdir(exist_ok=True)
Path('/home/sallumc/Documents/Omega/02-repos/06-afiliado-shopee/vitrine/dist/index.html').write_text(html)
print(f"Generated: {sum(c.products.length for c in catalog.categories)} products in {catalog.categories.length} categories")
