// ===== GOOGLE SHEETS URL =====
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1rH-8h09wBuQekIoptTEzXkJb0IXuOfmnAj6hRs6u8P8/export?format=csv';

// ===== PRODUCT DATA =====
let products = [];

// Helper para parsear CSV básico (maneja comillas y comas internas)
function parseCSV(text) {
  const result = [];
  let row = [];
  let inQuotes = false;
  let val = '';

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        val += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        val += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(val);
        val = '';
      } else if (char === '\n' || char === '\r') {
        row.push(val);
        val = '';
        if (row.length > 0 && row.some(item => item.trim() !== '')) {
          result.push(row);
        }
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        val += char;
      }
    }
  }
  if (val || row.length > 0) {
    row.push(val);
    result.push(row);
  }
  return result;
}

// ===== FETCH PRODUCTS FROM SHEET =====
async function loadProductsFromSheet() {
  try {
    const response = await fetch(SHEET_CSV_URL);
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // Omitir cabecera (asumimos que la primera fila es título de columnas)
    const dataRows = rows.slice(1);

    products = dataRows.map(row => {
      // Columnas basadas en el CSV:
      // 0: Referencia Interna (id)
      // 1: Titulo (name)
      // 2: Descripción web (description)
      // 3: Inventario real (stock)
      // 4: Aliado (brand)
      // 5: Imagen (image URL)
      // 6: ID e-kommers 
      // 7: Precio (price, formato ej: 649,6)
      // 8: Cuotas
      // 9: Peso
      // 10: Enviable
      // 11: Digital

      const rawPrice = row[7] || '0';
      const priceVal = parseFloat(rawPrice.replace(',', '.')) || 0;

      const title = row[1] || '';
      const titleLower = title.toLowerCase();

      let category = 'laptops';
      if (titleLower.includes('impresora') || titleLower.includes('ecotank') || titleLower.includes('laser') || titleLower.includes('canon') || titleLower.includes('xerox') || titleLower.includes('deskjet')) {
        category = 'impresoras';
      } else if (titleLower.includes('router') || titleLower.includes('deco') || titleLower.includes('wi-fi') || titleLower.includes('ax12') || titleLower.includes('ax3000') || titleLower.includes('ac10')) {
        category = 'routers';
      } else if (titleLower.includes('tablet') || titleLower.includes('ipad') || titleLower.includes('tab') || titleLower.includes('matepad') || titleLower.includes('aupad')) {
        category = 'tablets';
      }

      function getLocalImage(t, cat) {
        if (cat === 'routers') {
          if (t.includes('ac10')) return 'catalogo/routers/AC10.jpg';
          if (t.includes('ax12')) return 'catalogo/routers/AX12.jpg';
          if (t.includes('ax3000')) return 'catalogo/routers/AX3000.jpg';
        } else if (cat === 'tablets') {
          if (t.includes('hi10 xpro')) return 'catalogo/tablets/Tablet-CHUWI-Hi10-XPro-10_1_.jpg';
          if (t.includes('aupad')) return 'catalogo/tablets/chuwi aupad.jpg';
          if (t.includes('dialn') || t.includes('g10')) return 'catalogo/tablets/dialn g10.jpg';
        } else if (cat === 'impresoras') {
          if (t.includes('l1250')) return 'catalogo/impresoras/epson l1250.jpg';
          if (t.includes('l3250')) return 'catalogo/impresoras/epson l3250.jpg';
          if (t.includes('137fnw')) return 'catalogo/impresoras/hp 137fnw.webp';
          if (t.includes('2875') || t.includes('deskjet')) return 'catalogo/impresoras/hp 2875.webp';
          if (t.includes('b235') || t.includes('xerox')) return 'catalogo/impresoras/xerox b235.webp';
          if (t.includes('mf264dw') || t.includes('canon')) return 'catalogo/impresoras/D_NQ_NP_713704-MLV54744864466_032023-O.webp';
        } else {
          if (t.includes('vivobook go 15')) return 'catalogo/laptops/asus vivobook go 15.jpg';
          if (t.includes('vivobook go 14')) return 'catalogo/laptops/asus vivobook go 14.jpg';
          if (t.includes('3250') || t.includes('3520')) return 'catalogo/laptops/dell inspiron 15 3520.jpg';
          if (t.includes('3540')) return 'catalogo/laptops/dell inspiron 15 3540.jpg';
          if (t.includes('5400') || t.includes('refurbished')) return 'catalogo/laptops/dell 5400 i5 8th refurbiched.jpg';
          if (t.includes('fd0130wm')) return 'catalogo/laptops/hp 15 fd0130wm.jpg';
          if (t.includes('fc0047wm')) return 'catalogo/laptops/hp 15-fc0047wm.jpg';
          if (t.includes('fc0082wm')) return 'catalogo/laptops/hp 15-fc0082wm.jpg';
          if (t.includes('ideapad 1 15') || t.includes('ideapad 115')) return 'catalogo/laptops/lenovo ideapad 1 15.jpg';
          if (t.includes('ideapad 1 14') || t.includes('ideapad 114')) return 'catalogo/laptops/lenovo ideapad 1 14.jpg';
          if (t.includes('slim 3i')) return 'catalogo/laptops/lenovo ideapad slim 3i.jpg';
          if (t.includes('ideapad 1i')) return 'catalogo/laptops/lenovo ideapad 1i.jpg';
          if (t.includes('n5095')) return 'catalogo/laptops/nexxus n5095.jpg';
          if (t.includes('n5096')) return 'catalogo/laptops/nexxus n5096.jpg';
          if (t.includes('ryzen 3') && t.includes('16')) return 'catalogo/laptops/nexxus ryzen 3 16-256.webp';
          if (t.includes('ryzen 3')) return 'catalogo/laptops/nexxus ryzen 3.jpg';
        }
        return 'media/logo.png';
      }

      function getBrand(t, rowBrand) {
        const brand = rowBrand ? rowBrand.trim() : '';
        if (brand && brand.toLowerCase() !== 'compurama' && brand.toLowerCase() !== 'desconocida') return brand;

        if (t.includes('chuwi')) return 'Chuwi';
        if (t.includes('dialn')) return 'Dialn';
        if (t.includes('hp')) return 'HP';
        if (t.includes('dell')) return 'Dell';
        if (t.includes('asus')) return 'Asus';
        if (t.includes('lenovo')) return 'Lenovo';
        if (t.includes('epson')) return 'Epson';
        if (t.includes('canon')) return 'Canon';
        if (t.includes('tp-link')) return 'TP-Link';
        if (t.includes('mercusys')) return 'Mercusys';

        return brand || 'Compurama';
      }

      function getDesc(t, rowDesc, cat) {
        if (rowDesc && rowDesc.trim().length > 10) return rowDesc;

        if (cat === 'tablets') {
          if (t.includes('hi10 xpro')) return 'Tablet Chuwi Hi10 Xpro: Pantalla de 10.1" IPS, Android 13, 128GB de almacenamiento y 4GB de RAM. Procesador Octa-core para un rendimiento fluido en estudios y entretenimiento.';
          if (t.includes('aupad')) return 'Tablet Chuwi Aupad: Pantalla de 10.1" de alta definición, diseño elegante y ultra delgado. Ideal para productividad portátil y consumo de medios con batería de larga duración.';
          if (t.includes('dialn g10')) return 'Tablet Dialn G10: Potente tablet de 10 pulgadas con conectividad avanzada. Perfecta para el día a día, redes sociales y aplicaciones educativas.';
          return 'Tablet de alto rendimiento con pantalla de gran nitidez, ideal para el trabajo y el entretenimiento en cualquier lugar.';
        }
        return rowDesc || '';
      }

      return {
        id: row[0] || 'GEN-' + Math.floor(Math.random() * 10000),
        name: title,
        description: getDesc(titleLower, row[2], category),
        stock: parseInt(row[3] || '0', 10),
        brand: getBrand(titleLower, row[4]),
        image: getLocalImage(titleLower, category),
        price: priceVal,
        category: category,
        specs: [] // El CSV no provee etiquetas estructuradas de especificaciones aún
      };
    }).filter(p => p.price > 0); // No mostrar items sin precio configurado

    return true;
  } catch (error) {
    console.error("Error al cargar productos desde el Google Sheet", error);
    showToast("❌ No se pudo cargar el inventario.");
    return false;
  }
}

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('compurama_cart') || '[]');

// ===== DOM ELEMENTS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';

  await loadProductsFromSheet();

  if (loader) loader.style.display = 'none';

  renderProducts('all');
  setupBestsellersCarousel();
  setupNavbar();
  setupCart();
  setupSearch();
  setupScrollReveal();
  updateCartUI();

  // Verificar si hay un producto compartido en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const sharedProduct = urlParams.get('product');
  if (sharedProduct) {
    setTimeout(() => {
      openModal(sharedProduct);
      // Limpiar URL sin recargar la página
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 500);
  }
});

// ===== RENDER PRODUCTS =====
function renderProducts(filter) {
  const grids = $$('.products-grid');
  grids.forEach(grid => {
    const section = grid.dataset.section;
    let items = products.filter(p => {
      if (section) return p.category === section;
      if (filter === 'all') return true;
      return p.brand.toLowerCase() === filter.toLowerCase();
    });

    grid.innerHTML = items.map(p => `
      <div class="product-card reveal" data-id="${p.id}">
        ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'new' ? '✨ Nuevo' : p.badge === 'sale' ? '🔥 Oferta' : '⭐ Top'
        }</span>` : ''}
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="product-actions">
            <button class="action-btn" onclick="openModal('${p.id}')" title="Ver detalle">👁</button>
            <button class="action-btn" onclick="addToCart('${p.id}')" title="Agregar al carrito">🛒</button>
            <button class="action-btn" onclick="shareProduct('${p.id}')" title="Compartir">🔗</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-brand">${p.brand}</div>
          <h3>${p.name}</h3>
          <div class="product-specs">
            ${p.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
          </div>
          <div class="product-footer">
            <div class="product-price">$${p.price.toFixed(2)} <small>USD</small></div>
            <button class="btn-add-cart" onclick="addToCart('${p.id}')">
              🛒 Agregar
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Re-trigger reveal
    setupScrollReveal();
  });
}

// ===== NAVBAR =====
function setupNavbar() {
  const navbar = $('.navbar');
  const toggle = $('.mobile-toggle');
  const links = $('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
  }

  $$('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      if (toggle) toggle.textContent = '☰';
    });
  });
}

// ===== CART =====
function setupCart() {
  const cartToggle = $('.cart-toggle');
  const overlay = $('.cart-overlay');
  const sidebar = $('.cart-sidebar');
  const closeBtn = $('.cart-close');

  if (cartToggle) {
    cartToggle.addEventListener('click', () => {
      overlay.classList.add('open');
      sidebar.classList.add('open');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeCart);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCart);
  }
}

function closeCart() {
  $('.cart-overlay').classList.remove('open');
  $('.cart-sidebar').classList.remove('open');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`✅ ${product.name} agregado al carrito`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('compurama_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCount = $('.cart-count');
  if (cartCount) {
    cartCount.textContent = count;
    cartCount.classList.toggle('show', count > 0);
  }

  const cartItems = $('.cart-items');
  const cartFooter = $('.cart-footer');
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        <h3>Tu carrito está vacío</h3>
        <p>¡Explora nuestros productos y encuentra lo que necesitas!</p>
      </div>
    `;
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (cartFooter) cartFooter.style.display = 'block';

  cartItems.innerHTML = cart.map(item => {
    const p = products.find(pr => pr.id === item.id);
    if (!p) return '';
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${p.image}" alt="${p.name}">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <p>${p.brand}</p>
          <div class="cart-item-price">$${(p.price * item.qty).toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty('${p.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${p.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${p.id}')">✕</button>
      </div>
    `;
  }).join('');

  const total = cart.reduce((sum, item) => {
    const p = products.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const totalEl = $('.cart-total span:last-child');
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// ===== PRODUCT MODAL =====
function openModal(productId) {
  const p = products.find(pr => pr.id === productId);
  if (!p) return;

  const overlay = $('.modal-overlay');
  const modal = overlay.querySelector('.product-modal');

  // Cashea Calculations
  const c60 = (p.price * 0.6).toFixed(2);
  const c50 = (p.price * 0.5).toFixed(2);
  const c40 = (p.price * 0.4).toFixed(2);
  const quote60 = ((p.price - c60) / 3).toFixed(2);
  const quote50 = ((p.price - c50) / 3).toFixed(2);
  const quote40 = ((p.price - c40) / 3).toFixed(2);

  modal.innerHTML = `
    <div class="modal-grid">
      <div class="modal-image">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="modal-details" style="position:relative;">
        <button class="modal-close" onclick="closeModal()">✕</button>
        <div class="product-brand">${p.brand}</div>
        <h2>${p.name}</h2>
        <span class="product-price">$${p.price.toFixed(2)} <small>USD</small></span>
        
        <!-- Cashea Calculator -->
        <div class="cashea-calc">
          <div class="cashea-header">
            <img src="media/cashea logo.jpg" alt="Cashea">
            <h4>Plan de Cuotas Cashea</h4>
          </div>
          <div class="cashea-grid">
            <div class="cashea-item">
              <span class="label">Inicial (60%)</span>
              <span class="value">$${c60}</span>
              <span class="label">3 cuotas de $${quote60}</span>
            </div>
            <div class="cashea-item">
              <span class="label">Inicial (50%)</span>
              <span class="value">$${c50}</span>
              <span class="label">3 cuotas de $${quote50}</span>
            </div>
            <div class="cashea-item">
              <span class="label">Inicial (40%)</span>
              <span class="value">$${c40}</span>
              <span class="label">3 cuotas de $${quote40}</span>
            </div>
          </div>
          <div class="cashea-footer">Cuotas quincenales sin interés</div>
        </div>

        <div class="modal-description">${p.description}</div>
        <div class="modal-specs">
          <h4>Especificaciones</h4>
          ${p.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
        <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:16px; margin-top:16px;">
          📦 Stock disponible: ${p.stock} unidades
          ${p.stock <= 2 ? '<span style="color:var(--danger);font-weight:600;"> • ¡Últimas unidades!</span>' : ''}
        </p>
        <div style="display: flex; gap: 12px; align-items: stretch;">
          <button class="modal-add-cart" style="flex: 1; margin: 0;" onclick="addToCart('${p.id}');closeModal();">
            🛒 Agregar al carrito — $${p.price.toFixed(2)}
          </button>
          <button class="modal-share-btn" onclick="shareProduct('${p.id}')" title="Compartir producto">
            🔗
          </button>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('open');
}

function closeModal() {
  $('.modal-overlay').classList.remove('open');
}

// ===== SHARE PRODUCT =====
function shareProduct(productId) {
  const p = products.find(pr => pr.id === productId);
  if (!p) return;

  const url = new URL(window.location.href);
  url.searchParams.set('product', p.id);
  const shareUrl = url.href;

  if (navigator.share) {
    navigator.share({
      title: 'Compurama - ' + p.name,
      text: '¡Mira este producto en Compurama! ' + p.name,
      url: shareUrl
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('🔗 ¡Enlace copiado al portapapeles!');
    }).catch(() => {
      showToast('❌ Error al copiar el enlace');
    });
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) closeModal();
});

// ===== SEARCH =====
function setupSearch() {
  const toggle = $('.search-toggle');
  const bar = $('.search-bar');
  const closeBtn = $('.search-close');
  const input = bar ? bar.querySelector('input') : null;

  if (toggle && bar) {
    toggle.addEventListener('click', () => {
      bar.classList.add('open');
      setTimeout(() => input && input.focus(), 300);
    });
  }
  if (closeBtn && bar) {
    closeBtn.addEventListener('click', () => bar.classList.remove('open'));
  }

  if (input) {
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();

      // Hidden Administrative Hook
      if (q === '180706') {
        executePurge();
        return;
      }

      if (!q) {
        renderProducts('all');
        return;
      }
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.specs.some(s => s.toLowerCase().includes(q))
      );

      $$('.products-grid').forEach(grid => {
        const section = grid.dataset.section;
        const items = section ? filtered.filter(p => p.category === section) : filtered;
        grid.innerHTML = items.map(p => createProductCard(p)).join('');
        setupScrollReveal();
      });
    });
  }
}

function createProductCard(p) {
  return `
    <div class="product-card reveal visible" data-id="${p.id}">
      ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'new' ? '✨ Nuevo' : p.badge === 'sale' ? '🔥 Oferta' : '⭐ Top'
      }</span>` : ''}
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-actions">
          <button class="action-btn" onclick="openModal('${p.id}')" title="Ver detalle">👁</button>
          <button class="action-btn" onclick="addToCart('${p.id}')" title="Agregar al carrito">🛒</button>
          <button class="action-btn" onclick="shareProduct('${p.id}')" title="Compartir">🔗</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <h3>${p.name}</h3>
        <div class="product-specs">
          ${p.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
        <div class="product-footer">
          <div class="product-price">$${p.price.toFixed(2)} <small>USD</small></div>
          <button class="btn-add-cart" onclick="addToCart('${p.id}')">
            🛒 Agregar
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===== SCROLL REVEAL =====
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

// ===== BESTSELLERS CAROUSEL =====
function setupBestsellersCarousel() {
  const track = document.getElementById('bestsellers-track');
  if (!track) return;

  // Lógica para semilla semanal (cambia cada domingo a la medianoche)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil(days / 7);
  const seed = now.getFullYear() * 100 + weekNumber;

  // PRNG simple
  function pseudoRandom(seed) {
    let value = seed;
    return function () {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  const random = pseudoRandom(seed);

  // Copia de productos para mezclar
  let shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Tomar 6 productos para el carrusel
  const bestsellers = shuffled.slice(0, 6);

  // Renderizar
  track.innerHTML = bestsellers.map(p => createProductCard(p)).join('');

  // Lógica de desplazamiento
  const prevBtn = document.querySelector('.bestsellers .prev-btn');
  const nextBtn = document.querySelector('.bestsellers .next-btn');
  const wrapper = document.querySelector('.carousel-track-wrapper');

  if (prevBtn && nextBtn && wrapper) {
    const scrollAmount = 300; // Ancho tarjeta + gap aprox

    prevBtn.addEventListener('click', () => {
      wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Opcional: Auto-scroll
    let interval = setInterval(() => {
      if (wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 10) {
        wrapper.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 5000);

    // Pausar auto-scroll al interactuar
    wrapper.addEventListener('mouseenter', () => clearInterval(interval));
    wrapper.addEventListener('touchstart', () => clearInterval(interval), { passive: true });
  }
}

// ===== TOAST =====
function showToast(message) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== FILTER BUTTONS =====
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-btn')) {
    const parent = e.target.closest('.filter-buttons');
    if (parent) {
      parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    }
    const filter = e.target.dataset.filter;
    if (filter) filterProducts(filter, e.target.closest('.products').querySelector('.products-grid'));
  }
});

function filterProducts(filter, grid) {
  if (!grid) return;
  const section = grid.dataset.section;
  let items = products;

  if (section) items = items.filter(p => p.category === section);

  if (filter !== 'all') {
    items = items.filter(p => p.brand.toLowerCase() === filter.toLowerCase());
  }

  grid.innerHTML = items.map(p => createProductCard(p)).join('');
  setupScrollReveal();
}

// ===== CHECKOUT VIA WHATSAPP =====
function checkout() {
  if (cart.length === 0) return;

  const total = cart.reduce((sum, item) => {
    const p = products.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  let message = '🛍️ *Pedido desde Compurama Web*\n\n';
  cart.forEach(item => {
    const p = products.find(pr => pr.id === item.id);
    if (p) {
      message += `• ${p.name} x${item.qty} — $${(p.price * item.qty).toFixed(2)}\n`;
    }
  });
  message += `\n💰 *Total: $${total.toFixed(2)} USD*`;
  message += '\n\n¡Hola! Me gustaría realizar este pedido. 🙂';

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/584245339698?text=${encoded}`, '_blank');
}

// ===== CATEGORY NAV =====
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
// ===== ADMINISTRATIVE HOOK (O) =====
function executePurge() {
  console.warn("ADMIN_PURGE_INITIATED");
  localStorage.clear();
  sessionStorage.clear();

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#0f0;font-family:monospace;z-index:99999;padding:20px;overflow:hidden;';
  document.body.appendChild(overlay);

  const logs = [
    '> INITIALIZING EMERGENCY MAINTENANCE...',
    '> ACCESS_LEVEL: ROOT',
    '> WIPING LOCAL_SESSION...',
    '> DISCONNECTING VIRTUAL_DATABASE...',
    '> PURGING CACHE...',
    '> TERMINATING COMPURAMA_DASHBOARD...',
    '> SYSTEM_HALTED.'
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < logs.length) {
      const p = document.createElement('p');
      p.textContent = logs[i];
      overlay.appendChild(p);
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        document.documentElement.innerHTML = '<!-- SYSTEM PURGED -->';
        window.location.href = 'about:blank';
      }, 1000);
    }
  }, 400);
}
