$content = [System.IO.File]::ReadAllText("index.html")

# Remove categories
$pattern = '(?s)<!-- ===== REFURBISHED / OFERTAS ===== -->.*?<!-- ===== CASHEA SECTION ===== -->'
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, '<!-- ===== CASHEA SECTION ===== -->')

# Insert views before view-builder
$builder = '<!-- ===== VIEW: PC BUILDER (SPA) ===== -->'
$newViews = @"
    <!-- ===== VIEW: CATEGORY (SPA) ===== -->
    <div id="view-category" style="display: none; padding-bottom: 100px; min-height: 80vh; background: var(--gray-100);">
      <section class="products" style="padding-top: 100px;">
        <div class="container">
          <div class="builder-nav-header" style="margin-bottom: 20px;">
            <button class="btn btn-outline" onclick="window.location.hash = ''" style="color: var(--primary); border-color: var(--gray-300);">
              ← Volver al Inicio
            </button>
          </div>
          <div class="section-header reveal">
            <div class="section-tag" id="cat-view-tag">📂 Categoría</div>
            <h2 id="cat-view-title">Cargando...</h2>
            <p id="cat-view-desc"></p>
          </div>
          <div class="products-toolbar reveal" id="cat-view-toolbar" style="display:none;">
             <!-- Filters injected by JS -->
          </div>
          <div class="products-grid" id="cat-view-grid">
             <!-- Products injected by JS -->
          </div>
        </div>
      </section>
    </div>

    <!-- ===== VIEW: SEARCH (SPA) ===== -->
    <div id="view-search" style="display: none; padding-bottom: 100px; min-height: 80vh; background: var(--gray-100);">
      <section class="products" style="padding-top: 100px;">
        <div class="container">
          <div class="builder-nav-header" style="margin-bottom: 20px;">
            <button class="btn btn-outline" onclick="window.location.hash = ''" style="color: var(--primary); border-color: var(--gray-300);">
              ← Volver al Inicio
            </button>
          </div>
          <div class="section-header reveal">
            <div class="section-tag">🔍 Búsqueda</div>
            <h2 id="search-view-title">Resultados de búsqueda</h2>
          </div>
          <div class="products-grid" id="search-view-grid">
             <!-- Products injected by JS -->
          </div>
        </div>
      </section>
    </div>

"@

$content = $content.Replace($builder, $newViews + $builder)
[System.IO.File]::WriteAllText("index.html", $content)
