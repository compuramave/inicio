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
      const isRefurbished = titleLower.includes('refurbished') || titleLower.includes('reacondicionad') || titleLower.includes('refurb');
      
      const isPeripheral = titleLower.includes('mouse') || titleLower.includes('teclado') || titleLower.includes('keyboard') || titleLower.includes('audifono') || titleLower.includes('headset') || titleLower.includes('corneta');
      if (titleLower.startsWith('pc ') || titleLower === 'pc' || titleLower.includes('escritorio') || titleLower.includes('all in one') || titleLower.includes('desktop') || (titleLower.includes('gamer') && !isPeripheral && (titleLower.includes('pc') || titleLower.includes('ryzen') || titleLower.includes('rx ') || titleLower.includes('cpu')))) {
        category = 'pc';
      } else if (isRefurbished) {
        category = 'refurbished';
      } else if (titleLower.includes('impresora') || titleLower.includes('ecotank') || titleLower.includes('laser') || titleLower.includes('canon') || titleLower.includes('xerox') || titleLower.includes('deskjet')) {
        category = 'impresoras';
      } else if (titleLower.includes('router') || titleLower.includes('deco') || titleLower.includes('wi-fi') || titleLower.includes('ax12') || titleLower.includes('ax3000') || titleLower.includes('ac10') || titleLower.includes('ac12') || titleLower.includes('mercusys')) {
        category = 'routers';
      } else if (titleLower.includes('tablet') || titleLower.includes('ipad') || titleLower.includes('tab') || titleLower.includes('matepad') || titleLower.includes('aupad')) {
        category = 'tablets';
      } else if (titleLower.includes('mini ups') || titleLower.includes('ups') || titleLower.includes('kp2') || titleLower.includes('kp3')) {
        category = 'ups';
      } else if (titleLower.includes('monitor') || titleLower.includes('spidertec') || titleLower.includes('xiaomi') || titleLower.includes('pantalla')) {
        category = 'monitores';
      } else if (titleLower.includes('audifono') || titleLower.includes('audifonos') || titleLower.includes('headset') || titleLower.includes('corneta') || titleLower.includes('sonido') || titleLower.includes('gh513') || titleLower.includes('gh-513')) {
        category = 'audio';
      } else if (titleLower.includes('mouse') || titleLower.includes('raton') || titleLower.includes('gm217') || titleLower.includes('gm227') || titleLower.includes('gm316') || titleLower.includes('gm-217') || titleLower.includes('gm-227') || titleLower.includes('gm-316')) {
        category = 'mouses';
      } else if (titleLower.includes('teclado') || titleLower.includes('keyboard') || titleLower.includes('gk-980') || titleLower.includes('gk980') || titleLower.includes('kb-309') || titleLower.includes('kb309') || titleLower.includes('k7010')) {
        category = 'teclados';
      } else if (titleLower.includes('proyector') || titleLower.includes('magcubic') || titleLower.includes('hy300') || titleLower.includes('hy-300')) {
        category = 'proyectores';
      } else if (titleLower.includes('silla') || titleLower.includes('chair') || titleLower.includes('gamer chair') || titleLower.includes('sillas')) {
        category = 'sillas';
      } else if (titleLower.includes('microfono') || titleLower.includes('tx x2') || titleLower.includes('solapa') || titleLower.includes('roku') || titleLower.includes('fire tv') || titleLower.includes('dualshock') || titleLower.includes('ps4') || titleLower.includes('microsd') || titleLower.includes('micro sd') || titleLower.includes('ssd') || titleLower.includes('kingston') || titleLower.includes('dahua') || titleLower.includes('control ps')) {
        category = 'accesorios';
      }

      function getLocalImage(t, cat) {
        if (cat === 'routers') {
          if (t.includes('ax3000')) return 'catalogo/routers/AX3000.jpg';
          if (t.includes('ax12')) return 'catalogo/routers/AX12.jpg';
          if (t.includes('ac10') && !t.includes('ac12')) return 'catalogo/routers/AC10.jpg';
          if (t.includes('ac12') || t.includes('mercusys')) return 'catalogo/routers/AC12 AC1200.jpg';
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
        } else if (cat === 'ups') {
          if (t.includes('kp3')) return 'catalogo/UPS/mini ups marsriva kp3.jpg';
          if (t.includes('kp2')) return 'catalogo/UPS/mini ups marssiva kp2 ec.jpg';
        } else if (cat === 'monitores') {
          if (t.includes('spidertec') && t.includes('19.5')) return 'catalogo/monitores/monitor spidertec 19.5.jpg';
          if (t.includes('spidertec') && t.includes('21.5')) return 'catalogo/monitores/monitor spidertec 21.5.jpg';
          if (t.includes('xiaomi')) return 'catalogo/monitores/monitor xiaomi 27 165hz fhd.jpg';
        } else if (cat === 'accesorios') {
          if (t.includes('microfono')) return 'catalogo/Accesorios/Microfono TX Solapa Iphone y tipo C inalambrico 2 microfonos.jpg';
          if (t.includes('dualshock') || t.includes('ps4')) return 'catalogo/Accesorios/Dualshock 4.jpg';
          if (t.includes('fire tv')) return 'catalogo/Accesorios/Fire tv stick 4k select.jpg';
          if (t.includes('roku') && t.includes('stick')) return 'catalogo/Accesorios/Roku streaming stick hd.jpg';
          if (t.includes('roku')) return 'catalogo/Accesorios/Roku Express HD.jpg';
          if (t.includes('micro sd') || t.includes('kingston')) return 'catalogo/Accesorios/MICRO SD CARD 128GB KINGSTON.jpg';
          if (t.includes('ssd') && t.includes('128')) return 'catalogo/Accesorios/ssd 128gb dahua.jpg';
          if (t.includes('ssd') && t.includes('256')) return 'catalogo/Accesorios/ssd 256gb dahua.jpg';
          if (t.includes('ssd') && t.includes('1tb')) return 'catalogo/Accesorios/ssd 1tb dahua.jpg';
        } else if (cat === 'audio') {
          if (t.includes('gh513w') || t.includes('xtrike')) return 'catalogo/audio/Audifonos Xtrike me GH513W.jpg';
        } else if (cat === 'mouses') {
          if (t.includes('gm217') || t.includes('gm-217')) return 'catalogo/mouses/mouse gamer xtrikeme gm217.jpg';
          if (t.includes('gm227') || t.includes('gm-227')) return 'catalogo/mouses/mouse gamer xtrikeme gm227.jpg';
          if (t.includes('gm316w') || t.includes('gm-316w') || t.includes('gm316')) return 'catalogo/mouses/mouse gamer xtrikeme gm316w.jpg';
        } else if (cat === 'teclados') {
          if (t.includes('k7010') || t.includes('delux')) return 'catalogo/teclados/teclado delux k7010.jpg';
          if (t.includes('gk-980') || t.includes('gk980')) return 'catalogo/teclados/teclado-xtrike-me-gaming-gk-980.jpg';
          if (t.includes('kb309') || t.includes('kb-309')) return 'catalogo/teclados/xtrike me kb309.jpg';
        } else if (cat === 'proyectores') {
          if (t.includes('hy300') || t.includes('hy-300') || t.includes('magcubic')) return 'catalogo/proyectores/proyector magcubic hy300 pro 720p.jpg';
        } else if (cat === 'sillas') {
          if (t.includes('asturias') || t.includes('arturia')) return 'catalogo/mobiliarios/ASTURIAS-NEGRA-430x382.jpg';
          if (t.includes('madison')) return 'catalogo/mobiliarios/Silla-Ejecutiva-MADISON-N-1.jpg';
          if (t.includes('trendy')) return 'catalogo/mobiliarios/silla ejecutiva trendy.jpg';
        } else if (cat === 'pc') {
          if (t.includes('z240')) return 'catalogo/pc/HP REFURBISHED Z240.jpg';
          if (t.includes('7010')) return 'catalogo/pc/Dell Refurbished Optiplex 7010.jpg';
          if (t.includes('astron')) return 'catalogo/pc/PC NUEVA ASTRON.jpg';
          if (t.includes('gamer') || t.includes('ryzen 5') || t.includes('rx 470') || t.includes('rx 570')) return 'catalogo/pc/PC RYZEN 5 2600 RX 570.jpg';
        } else if (cat === 'refurbished') {
          if (t.includes('5400')) return 'catalogo/laptops/dell 5400 i5 8th refurbiched.jpg';
          if (t.includes('dell') && (t.includes('4ta') || t.includes('4th'))) return 'catalogo/laptops/dell i5 4ta 8 128 refurbished.jpg';
          if (t.includes('hp') && t.includes('probook')) return 'catalogo/laptops/hp probook i5 4ta.jpg';
          if (t.includes('l390')) return 'catalogo/laptops/Lenovo l390 refurbished.jpg';
          if (t.includes('t440')) return 'catalogo/laptops/lenovo t440.jpg';
          if (t.includes('x260')) return 'catalogo/laptops/lenovo x260.jpg';
          if (t.includes('surface') && t.includes('10')) return 'catalogo/laptops/microsoft surface i5 10va 8 y 256.jpg';
          if (t.includes('surface') && t.includes('11')) return 'catalogo/laptops/microsoft surface i5 11va 8 y 256.jpg';
          if (t.includes('surface')) return 'catalogo/laptops/microsoft surface i5 11va 8 y 256.jpg';
          
          // Fallbacks for generic titles in the sheet
          if (t.includes('microsoft')) return 'catalogo/laptops/microsoft surface i5 10va 8 y 256.jpg';
          if (t.includes('dell')) return 'catalogo/laptops/dell i5 4ta 8 128 refurbished.jpg';
          if (t.includes('hp')) return 'catalogo/laptops/hp probook i5 4ta.jpg';
          if (t.includes('lenovo')) return 'catalogo/laptops/lenovo t440.jpg';
        } else {
          if (t.includes('vivobook go 15')) return 'catalogo/laptops/asus vivobook go 15.jpg';
          if (t.includes('vivobook go 14')) return 'catalogo/laptops/asus vivobook go 14.jpg';
          if (t.includes('3250') || t.includes('3520')) return 'catalogo/laptops/dell inspiron 15 3520.jpg';
          if (t.includes('3540')) return 'catalogo/laptops/dell inspiron 15 3540.jpg';
          if (t.includes('5400')) return 'catalogo/laptops/dell 5400 i5 8th refurbiched.jpg';
          if (t.includes('fd0130wm')) return 'catalogo/laptops/hp 15 fd0130wm.jpg';
          if (t.includes('fc0047wm')) return 'catalogo/laptops/hp 15-fc0047wm.jpg';
          if (t.includes('fc0082wm')) return 'catalogo/laptops/hp 15-fc0082wm.jpg';
          if (t.includes('ideapad 1 15') || t.includes('ideapad 115')) return 'catalogo/laptops/lenovo ideapad 1 15.jpg';
          if (t.includes('ideapad 1 14') || t.includes('ideapad 114')) return 'catalogo/laptops/lenovo ideapad 1 14.jpg';
          if (t.includes('slim 3i')) return 'catalogo/laptops/lenovo ideapad slim 3i.jpg';
          if (t.includes('ideapad 1i')) return 'catalogo/laptops/lenovo ideapad 1i.jpg';
          if (t.includes('surface') && t.includes('10')) return 'catalogo/laptops/microsoft surface i5 10va 8 y 256.jpg';
          if (t.includes('surface') && t.includes('11')) return 'catalogo/laptops/microsoft surface i5 11va 8 y 256.jpg';
          if (t.includes('surface')) return 'catalogo/laptops/microsoft surface i5 11va 8 y 256.jpg';
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
        if (t.includes('microsoft') || t.includes('surface')) return 'Microsoft';
        if (t.includes('hp')) return 'HP';
        if (t.includes('dell')) return 'Dell';
        if (t.includes('asus')) return 'Asus';
        if (t.includes('lenovo')) return 'Lenovo';
        if (t.includes('epson')) return 'Epson';
        if (t.includes('canon')) return 'Canon';
        if (t.includes('tp-link')) return 'TP-Link';
        if (t.includes('mercusys')) return 'Mercusys';
        if (t.includes('marsriva')) return 'Marsriva';
        if (t.includes('astron')) return 'Astron';
        if (t.includes('xtrike')) return 'Xtrike Me';
        if (t.includes('delux')) return 'Delux';
        if (t.includes('dahua')) return 'Dahua';
        if (t.includes('roku')) return 'Roku';
        if (t.includes('fire tv') || t.includes('amazon')) return 'Amazon';
        if (t.includes('kingston')) return 'Kingston';
        if (t.includes('magcubic')) return 'Magcubic';
        if (t.includes('dualshock') || t.includes('ps4') || t.includes('playstation')) return 'Sony';
        if (t.includes('nexxus')) return 'Nexxus';
        if (t.includes('xerox')) return 'Xerox';

        return brand || 'Compurama';
      }

      function getProductEnhancements(titleLower, rowDesc, category, rawTitle) {
        let desc = rowDesc && rowDesc.trim().length > 10 ? rowDesc : '';
        let specs = [];

        if (category === 'laptops' || category === 'refurbished') {
          if (titleLower.includes('ryzen 3')) specs.push('Procesador AMD Ryzen 3');
          else if (titleLower.includes('ryzen 5')) specs.push('Procesador AMD Ryzen 5');
          else if (titleLower.includes('ryzen 7')) specs.push('Procesador AMD Ryzen 7');
          else if (titleLower.includes('i3')) specs.push('Procesador Intel Core i3');
          else if (titleLower.includes('i5')) specs.push('Procesador Intel Core i5');
          else if (titleLower.includes('i7')) specs.push('Procesador Intel Core i7');
          else if (titleLower.includes('n5095') || titleLower.includes('cameron')) specs.push('Procesador Intel Celeron N5095');
          else if (titleLower.includes('n5096')) specs.push('Procesador Intel Celeron N5096');

          if (titleLower.match(/8\s*(?:gb)?\s*(?:y|\/|-)?\s*256\s*(?:gb)?/i) || (rowDesc && (rowDesc.includes('8/256GB') || (rowDesc.includes('8GB') && rowDesc.includes('256GB'))))) {
            specs.push('Memoria RAM: 8GB', 'Almacenamiento: 256GB SSD');
          } else if (titleLower.match(/16\s*(?:gb)?\s*(?:y|\/|-)?\s*512\s*(?:gb)?/i) || (rowDesc && (rowDesc.includes('16/512GB') || (rowDesc.includes('16GB') && rowDesc.includes('512GB'))))) {
            specs.push('Memoria RAM: 16GB', 'Almacenamiento: 512GB SSD');
          } else if (titleLower.match(/8\s*(?:gb)?\s*(?:y|\/|-)?\s*512\s*(?:gb)?/i)) {
            specs.push('Memoria RAM: 8GB', 'Almacenamiento: 512GB SSD');
          } else if (titleLower.match(/16\s*(?:gb)?\s*(?:y|\/|-)?\s*256\s*(?:gb)?/i)) {
            specs.push('Memoria RAM: 16GB', 'Almacenamiento: 256GB SSD');
          }

          if (titleLower.includes('vivobook') || titleLower.includes('ideapad') || titleLower.includes('surface') || titleLower.includes('latitude') || titleLower.includes('thinkpad')) {
             if (titleLower.includes('vivobook')) desc = desc || 'Asus Vivobook: Diseño elegante, pantalla de marcos ultra delgados y rendimiento superior para tu día a día.';
             else if (titleLower.includes('ideapad')) desc = desc || 'Lenovo IdeaPad: Potencia y portabilidad en un chasis moderno. Ideal para estudio y teletrabajo con sonido estéreo.';
             else if (titleLower.includes('surface')) desc = desc || 'Microsoft Surface: Experiencia premium 2-en-1 con pantalla táctil y diseño ligero para productividad en marcha.';
             else if (titleLower.includes('latitude')) desc = desc || 'Dell Latitude: Robustez empresarial y herramientas de seguridad avanzadas. Lista para grandes proyectos empresariales.';
             else if (titleLower.includes('thinkpad')) desc = desc || 'Lenovo ThinkPad: El estándar de oro empresarial. Teclado ergonómico, diseño MIL-SPEC super resistente y batería de larga duración.';
          }

          if (category === 'refurbished') {
            desc += (desc ? ' ' : '') + 'Equipo Reacondicionado Certificado. Incluye 3 meses de garantía por defectos de fábrica. Probado y testeado para máximo rendimiento a un precio imbatible.';
          } else {
             desc = desc || 'Laptop de última generación con rendimiento excepcional, ideal para trabajo, estudios y entretenimiento digital.';
          }
        } 
        else if (category === 'pc') {
          if (titleLower.includes('gamer') || titleLower.includes('rx ') || titleLower.includes('ryzen')) {
            desc = desc || 'PC de Escritorio Gamer: Ensamblada con componentes de alto rendimiento para correr tus juegos favoritos y aplicaciones exigentes de diseño o edición.';
            if (titleLower.includes('ryzen 5 2600')) specs.push('Procesador AMD Ryzen 5 2600');
            if (titleLower.includes('rx 470') || titleLower.includes('rx 570')) specs.push('Gráficos Radeon RX series');
          } else {
            desc = desc || 'Computadora de Escritorio: Ensamblada para ofrecer estabilidad y rendimiento en tareas de oficina, puntos de venta o uso doméstico.';
          }
          if (titleLower.includes('8') && titleLower.includes('256')) {
            specs.push('Memoria RAM: 8GB', 'Almacenamiento: 256GB SSD');
          }
        }
        else if (category === 'monitores') {
          if (titleLower.includes('xiaomi')) {
            desc = desc || 'Monitor Xiaomi de 27 pulgadas, 165Hz de tasa de refresco y resolución FHD. Experiencia de juego ultra fluida con colores vibrantes y diseño minimalista sin bordes.';
            specs.push('Tamaño: 27"', 'Frecuencia: 165Hz', 'Resolución: Full HD');
          } else if (titleLower.includes('spidertec')) {
             if (titleLower.includes('19.5')) {
               desc = desc || 'Monitor Spidertec de 19.5 pulgadas con entradas HDMI y VGA. Resolución clara y diseño compacto, ideal para oficina y tareas diarias.';
               specs.push('Tamaño: 19.5"', 'Conexiones: HDMI, VGA');
             } else if (titleLower.includes('21.5')) {
               desc = desc || 'Monitor Spidertec de 21.5 pulgadas con entradas HDMI y VGA. Mayor espacio de visualización con nitidez excepcional para productividad y entretenimiento.';
               specs.push('Tamaño: 21.5"', 'Conexiones: HDMI, VGA');
             }
          }
          if (specs.length === 0) {
            desc = desc || 'Monitor de alta resolución con excelente nitidez y colores vibrantes para trabajo o gaming.';
          }
        }
        else if (category === 'impresoras') {
          if (titleLower.includes('laser')) specs.push('Tecnología: Láser');
          else if (titleLower.includes('ecotank') || titleLower.includes('tinta')) specs.push('Tecnología: Inyección de Tinta (EcoTank)');

          if (titleLower.includes('l1250') || titleLower.includes('wifi') || titleLower.includes('wi-fi') || titleLower.includes('mf264dw')) specs.push('Conectividad: Wi-Fi Integrado');

          if (titleLower.includes('epson')) {
            desc = desc || 'Impresora Epson de alto rendimiento. Resultados profesionales en cada impresión con gran ahorro en consumibles.';
          } else if (titleLower.includes('hp')) {
            desc = desc || 'Impresora HP: Calidad de texto y gráficos insuperable. Diseño compacto ideal para el hogar o pequeña oficina.';
          }
          desc = desc || 'Impresora versátil y confiable, lista para cubrir tus necesidades de documentos e imágenes nítidas.';
        }
        else if (category === 'routers') {
          if (titleLower.includes('ax12') || titleLower.includes('ax3000') || titleLower.includes('wifi 6')) {
            specs.push('Tecnología: Wi-Fi 6');
            if (titleLower.includes('ax3000')) specs.push('Velocidad Combinada: Hasta 3000 Mbps');
            if (titleLower.includes('ax12')) specs.push('Bandas: Dual Band (2.4GHz / 5GHz)');
            desc = desc || 'Router de última generación Wi-Fi 6: Elimina el lag de tus juegos y asegura streaming en 4K/8K sin interrupciones con capacidad para múltiples dispositivos.';
          } else if (titleLower.includes('ac12') || titleLower.includes('ac10') || titleLower.includes('ac1200')) {
            specs.push('Tecnología: Wi-Fi 5 (AC)');
            specs.push('Velocidad Combinada: Hasta 1200 Mbps');
            desc = desc || 'Router Inalámbrico Dual Band. Ofrece conexiones simultáneas para trabajo fluido, videollamadas claras y entretenimiento digital.';
          }
          if (specs.length === 0) desc = desc || 'Router inalámbrico de alta potencia para extender y asegurar tu conexión a internet por toda la casa.';
        }
        else if (category === 'tablets') {
          if (titleLower.includes('hi10 xpro')) {
            desc = desc || 'Tablet Chuwi Hi10 Xpro: Pantalla de 10.1" IPS, Android 13, 128GB de almacenamiento y 4GB de RAM. Procesador Octa-core para un rendimiento fluido en estudios y entretenimiento.';
            specs.push('Pantalla: 10.1" IPS', 'Sistema: Android 13', 'Almacenamiento: 128GB', 'RAM: 4GB');
          } else if (titleLower.includes('aupad')) {
            desc = desc || 'Tablet Chuwi Aupad: Pantalla de 10.1" de alta definición, diseño elegante y ultra delgado. Ideal para productividad portátil y consumo de medios con batería de larga duración.';
            specs.push('Pantalla: 10.1" HD');
          }
          desc = desc || 'Tablet de alto rendimiento con diseño ultraportable. Perfecta para consumir contenido multimedia, navegar y estudiar.';
        }
        else if (category === 'ups') {
          if (titleLower.includes('kp3')) {
            desc = desc || 'Mini UPS Marsriva KP3 de 10.000 mAh. Proporciona energía de respaldo ininterrumpida para routers, módems y cámaras de seguridad. Durabilidad teórica: hasta 8 horas de respaldo continuo.';
            specs.push('Capacidad: 10.000 mAh', 'Salidas Múltiples', 'Autonomía: Hasta 8 horas');
          } else if (titleLower.includes('kp2')) {
            desc = desc || 'Mini UPS Marsriva KP2 EC de 8.000 mAh. Sistema de respaldo inteligente y compacto para dispositivos de red. Durabilidad teórica: entre 4 y 6 horas de energía ininterrumpida.';
            specs.push('Capacidad: 8.000 mAh', 'Salidas DC PoE', 'Autonomía: Hasta 6 horas');
          }
          desc = desc || 'Powerbank / Mini UPS de alta capacidad para mantener el internet activo durante cortes de luz.';
        }
        else if (category === 'accesorios') {
          if (titleLower.includes('microfono')) {
            desc = desc || 'Set de micrófonos de alta fidelidad, diseñados para capturar la mejor voz, reduciendo ruidos e interferencias. Ideales para solapa, vlogs o entrevistas.';
            specs.push('Tipo: Omnidireccional', 'Conexión Plug & Play');
          } else if (titleLower.includes('control') || titleLower.includes('dualshock')) {
            desc = desc || 'Mando ergonómico para videojuegos con respuesta táctil precisa, compatible con tus plataformas favoritas para largas sesiones de gaming.';
            specs.push('Diseño Ergonómico', 'Sticks de Alta Precisión');
          } else if (titleLower.includes('roku') || titleLower.includes('fire tv')) {
            desc = desc || 'Dispositivo de streaming que convierte cualquier TV en inteligente. Accede a las principales plataformas como Netflix, YouTube y Prime Video en alta definición.';
            if (titleLower.includes('4k')) specs.push('Resolución: 4K Ultra HD');
            specs.push('Control Remoto con Voz');
          } else if (titleLower.includes('ssd') || titleLower.includes('micro sd')) {
             desc = desc || 'Almacenamiento flash de alta velocidad, multiplicando el rendimiento de lectura y escritura comparado con las unidades tradicionales.';
             if (titleLower.includes('1tb')) specs.push('Capacidad: 1TB');
             else if (titleLower.includes('512') || titleLower.includes('500')) specs.push('Capacidad: 512GB/500GB');
             else if (titleLower.includes('256') || titleLower.includes('240')) specs.push('Capacidad: 256GB/240GB');
             else if (titleLower.includes('128') || titleLower.includes('120')) specs.push('Capacidad: 128GB/120GB');
          }
          desc = desc || 'Accesorio tecnológico imprescindible de alta durabilidad y máximo rendimiento para optimizar tu set-up.';
        }
        else if (category === 'mouses' || category === 'teclados' || category === 'audio') {
           if (titleLower.includes('gamer')) {
             desc = desc || 'Periférico Gamer avanzado con iluminación integrada y diseño enfocado en la precisión y rapidez de respuesta.';
             specs.push('Estilo Gamer', 'Alta Respuesta');
             if (category === 'mouses') specs.push('Sensor Óptico Preciso', 'DPI Ajustable');
             if (category === 'teclados') specs.push('Retroiluminado', 'Tactilidad Superior');
             if (category === 'audio') specs.push('Sonido Envolvente', 'Micrófono Omnidireccional', 'Cancelación de Ruido Pasiva');
           } else {
             desc = desc || 'Periférico de oficina diseñado para ofrecer una jornada laboral cómoda y eficiente. Materiales duraderos y de suave pulsación.';
           }
        }
        else if (category === 'sillas') {
          desc = desc || 'Silla ergonómica de alta resistencia, fabricada con materiales acolchados que se ajustan al contorno natural de tu espalda. Ideal tanto para setups gamer como oficinas.';
          specs.push('Diseño Ergonómico', 'Altura Ajustable', 'Base de Alta Resistencia');
        }
        else if (category === 'proyectores') {
          desc = desc || 'Lleva el cine a tu sala con este proyector portátil. Excelente luminosidad, conectividad inteligente y altavoces integrados.';
          if (titleLower.includes('720p')) specs.push('Resolución Nativa: 720p HD (Soporta 1080p)');
          if (titleLower.includes('magcubic')) specs.push('Sistema Smart Integrado', 'Ajuste de Ángulo Libre');
        }
        else {
          desc = desc || 'Excelente equipo de alta durabilidad, diseñado con tecnología confiable para simplificarte la vida.';
        }

        return { description: desc, specs: specs };
      }

      const localImagePath = getLocalImage(titleLower, category);
      const enhancements = getProductEnhancements(titleLower, row[2], category, title);
      
      return {
        id: row[0] || 'GEN-' + Math.floor(Math.random() * 10000),
        name: title,
        description: enhancements.description,
        stock: parseInt(row[3] || '0', 10),
        brand: getBrand(titleLower, row[4]),
        image: (row[5] && row[5].trim().startsWith('http') && !row[5].includes('imgur.com/a/')) ? row[5].trim() : localImagePath,
        localImage: localImagePath,
        price: priceVal,
        category: category,
        badge: isRefurbished ? 'sale' : null,
        specs: enhancements.specs
      };
    }).filter(p => p.price > 0); // No mostrar items sin precio configurado

    return true;
  } catch (error) {
    console.error("Error al cargar productos desde el Google Sheet", error);
    showToast("❌ No se pudo cargar el inventario.");
    return false;
  }
}

// ===== TRACKING HELPER =====
function trackEvent(name, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', name, params);
    console.log(`[GA4] Tracked: ${name}`, params);
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
  setupCarousels();
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

  // Activar temporizador Flash
  updateFlashTimer();
  setInterval(updateFlashTimer, 1000);



  // Escuchar cambios de hash para navegación directa
  window.addEventListener('hashchange', () => {
    const section = window.location.hash.replace('#', '');
    if (section) trackSectionView(section);
  });
});

// ===== VIRTUAL PAGE VIEW HELPER =====
function trackSectionView(sectionId) {
  const titles = {
    'inicio': 'Inicio',
    'categorias': 'Categorías',
    'refurbished': 'Ofertas Refurbished',
    'laptops': 'Catálogo de Laptops',
    'pc': 'PCs de Escritorio',
    'impresoras': 'Impresoras y Multifuncionales',
    'routers': 'Routers y Conectividad',
    'tablets': 'Tablets y iPads',
    'ups': 'Sistemas de Respaldo',
    'monitores': 'Monitores y Pantallas',
    'accesorios': 'Accesorios y Periféricos',
    'audio': 'Sonido y Audio',
    'mouses': 'Mouses y Punteros',
    'teclados': 'Teclados y Gamers',
    'proyectores': 'Proyectores y Cine',
    'sillas': 'Sillas Gamer y Oficina',
    'cashea': 'Financiamiento Cashea',
    'nosotros': 'Sobre Compurama',
    'contacto': 'Contacto'
  };

  const sectionTitle = titles[sectionId] || sectionId;
  const fullTitle = `Compurama | ${sectionTitle}`;

  if (typeof gtag === 'function') {
    gtag('config', 'G-2EP0XH6XEY', {
      'page_title': fullTitle,
      'page_path': window.location.pathname + '#' + sectionId
    });
    console.log(`[GA4] Virtual Page View: ${fullTitle}`);
  }
}

// ===== FLASH TIMER =====
function updateFlashTimer() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;

  if (diff <= 0) return;

  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  const elH = document.getElementById('cd-hours');
  const elM = document.getElementById('cd-minutes');
  const elS = document.getElementById('cd-seconds');

  if (elH) elH.textContent = h.toString().padStart(2, '0');
  if (elM) elM.textContent = m.toString().padStart(2, '0');
  if (elS) elS.textContent = s.toString().padStart(2, '0');
}



// ===== RENDER PRODUCTS =====
function renderProducts(filter) {
  const grids = $$('.carousel-track[data-section]');
  grids.forEach(grid => {
    const section = grid.dataset.section;
    let items = products.filter(p => {
      if (section) return p.category === section;
      if (filter === 'all') return true;
      return p.brand.toLowerCase() === filter.toLowerCase();
    });

    grid.innerHTML = items.map(p => createProductCard(p)).join('');

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

  if (product.stock <= 0) {
    showToast(`⛔ ${product.name} no está disponible`);
    return;
  }

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`✅ ${product.name} agregado al carrito`);

  // Track: Add to Cart
  trackEvent('add_to_cart', {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    price: product.price,
    currency: 'USD'
  });
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
        <img class="cart-item-img" src="${p.image}" alt="${p.name}" onerror="this.onerror=null; this.src='${p.localImage}';">
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
        <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null; this.src='${p.localImage}';">
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
        ${p.specs && p.specs.length > 0 ? `
        <div class="modal-specs">
          <h4>Especificaciones</h4>
          ${p.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
        ` : ''}
        ${p.stock > 0 ? `
        <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:16px; margin-top:16px;">
          📦 Stock disponible: ${p.stock} unidades
          ${p.stock <= 2 ? '<span style="color:var(--danger);font-weight:600;"> • ¡Últimas unidades!</span>' : ''}
        </p>` : `
        <div class="modal-out-of-stock">
          <span>⛔</span>
          <p>Este producto no está disponible actualmente</p>
        </div>`}
        <div style="display: flex; gap: 12px; align-items: stretch;">
          ${p.stock > 0 ? `
          <button class="modal-add-cart" style="flex: 1; margin: 0;" onclick="addToCart('${p.id}');closeModal();">
            🛒 Agregar al carrito — $${p.price.toFixed(2)}
          </button>` : `
          <button class="modal-add-cart btn-disabled" style="flex: 1; margin: 0;" disabled>
            ⛔ No Disponible
          </button>`}
          <button class="modal-share-btn" onclick="shareProduct('${p.id}')" title="Compartir producto">
            🔗
          </button>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('open');

  // Track: View Item
  trackEvent('view_item', {
    item_id: p.id,
    item_name: p.name,
    item_category: p.category,
    price: p.price,
    currency: 'USD'
  });
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

  // Track: Social Share
  trackEvent('share', {
    method: navigator.share ? 'native' : 'clipboard',
    content_type: 'product',
    item_id: p.id,
    item_name: p.name
  });
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
  const resultsContainer = $('#search-results');

  if (toggle && bar) {
    toggle.addEventListener('click', () => {
      bar.classList.add('open');
      setTimeout(() => input && input.focus(), 300);
    });
  }

  if (closeBtn && bar) {
    closeBtn.addEventListener('click', () => {
      bar.classList.remove('open');
      if (resultsContainer) resultsContainer.classList.remove('active');
    });
  }

  if (input) {
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();

      // Hidden Administrative Hook
      if (q === '180706') {
        executePurge();
        return;
      }

      showSearchSuggestions(q, resultsContainer);
    });

    // Handle Enter Key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.toLowerCase().trim();
        performSearch(q);
        if (resultsContainer) resultsContainer.classList.remove('active');
        bar.classList.remove('open');
      }
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar') && resultsContainer) {
      resultsContainer.classList.remove('active');
    }
  });
}

function showSearchSuggestions(q, container) {
  if (!container) return;
  if (!q || q.length < 2) {
    container.classList.remove('active');
    return;
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q)
  ).slice(0, 10);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="search-no-results">No se encontraron productos coincidentes</div>';
  } else {
    container.innerHTML = filtered.map(p => `
      <div class="search-item" onclick="selectSearchItem('${p.id}')">
        <img src="${p.image}" class="search-item-img" onerror="this.onerror=null; this.src='${p.localImage}';">
        <div class="search-item-info">
          <h4>${p.name}</h4>
          <p>${p.brand} • ${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>
        </div>
        <div class="search-item-price">$${p.price.toFixed(2)}</div>
      </div>
    `).join('');
  }
  container.classList.add('active');
}

function selectSearchItem(id) {
  const p = products.find(pr => pr.id === id);
  if (!p) return;

  openModal(id);
  const resultsContainer = $('#search-results');
  const bar = $('.search-bar');
  
  if (resultsContainer) resultsContainer.classList.remove('active');
  if (bar) bar.classList.remove('open');

  // Scroll to section for context
  setTimeout(() => scrollToSection(p.category), 300);
}

function performSearch(q) {
  if (!q) {
    renderProducts('all');
    return;
  }

  // Track search, now including results check
  // (We move the event call after filtering to count results)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );

  let firstFoundSection = null;

  $$('.carousel-track[data-section]').forEach(grid => {
    const section = grid.dataset.section;
    const items = section ? filtered.filter(p => p.category === section) : filtered;
    grid.innerHTML = items.map(p => createProductCard(p)).join('');
    
    if (items.length > 0 && !firstFoundSection) {
      firstFoundSection = section;
    }
    setupScrollReveal();
  });

  // Track: Search with results count
  trackEvent('search', { 
    search_term: q,
    results_count: filtered.length
  });

  if (firstFoundSection) {
    scrollToSection(firstFoundSection);
    showToast(`🔍 Mostrando resultados para "${q}"`);
  } else {
    showToast(`❌ No se encontraron resultados para "${q}"`);
  }
}

function createProductCard(p) {
  const outOfStock = p.stock <= 0;
  
  // Simulated PcComponentes Data
  const idHash = p.name.length + (p.price * 10);
  const rating = (4.5 + (idHash % 5) * 0.1).toFixed(1); 
  const reviews = 15 + (idHash % 300);
  
  // Decide badge text dynamically for "sale" to make it more aggressive sometimes
  let badgeHtml = '';
  if (outOfStock) {
    badgeHtml = '<span class="product-badge badge-unavailable">⛔ No Disponible</span>';
  } else if (p.badge) {
    if (p.badge === 'sale') {
      const isExtreme = (idHash % 2 === 0);
      badgeHtml = `<span class="product-badge ${isExtreme ? 'badge-history' : 'badge-trending'}">${isExtreme ? '¡Precio mínimo!' : '🔥 Trending'}</span>`;
    } else {
      badgeHtml = `<span class="product-badge badge-${p.badge}">${p.badge === 'new' ? '✨ Nuevo' : '⭐ Top'}</span>`;
    }
  }

  // Simulate old price for refurbished / sale items
  const hasDiscount = (p.category === 'refurbished' || p.badge === 'sale');
  const discountMultiplier = 1.2 + ((idHash % 3) * 0.1); // 20% to 40%
  const oldPrice = hasDiscount ? (p.price * discountMultiplier).toFixed(2) : null;

  return `
    <div class="product-card reveal visible${outOfStock ? ' out-of-stock' : ''}" data-id="${p.id}">
      ${badgeHtml}
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='${p.localImage}';">
        ${outOfStock ? '<div class="out-of-stock-overlay"><span>No Disponible</span></div>' : ''}
        <div class="product-actions">
          <button class="action-btn" onclick="openModal('${p.id}')" title="Ver detalle">👁</button>
          ${!outOfStock ? `<button class="action-btn" onclick="addToCart('${p.id}')" title="Agregar al carrito">🛒</button>` : ''}
          <button class="action-btn" onclick="shareProduct('${p.id}')" title="Compartir">🔗</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-title">${p.name}</div>
        
        <div class="product-rating">
          <span class="stars">★★★★★</span>
          <span class="rating-text">${rating}/5 (${reviews} opiniones)</span>
        </div>
        
        <div class="product-specs">
          ${p.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
        
        <div class="product-shipping">
          <span class="shipping-icon">🚚</span> Envío a nivel nacional
        </div>
        
        <div class="product-footer">
          <div class="product-price">
            $${p.price.toFixed(2)} <small>USD</small>
            ${oldPrice ? `<span class="old-price">$${oldPrice}</span>` : ''}
          </div>
          <button class="btn-add-cart${outOfStock ? ' btn-disabled' : ''}" onclick="${outOfStock ? '' : `addToCart('${p.id}')`}" ${outOfStock ? 'disabled' : ''}>
            ${outOfStock ? '⛔ Agotado' : '🛒 Agregar'}
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
}

// ===== ALL CAROUSELS LOGIC =====
function setupCarousels() {
  $$('.carousel-container').forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');
    const wrapper = container.querySelector('.carousel-track-wrapper');

    if (prevBtn && nextBtn && wrapper) {
      const scrollAmount = 300; // Ancho tarjeta + gap aprox

      prevBtn.addEventListener('click', () => {
        wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      // Funcionalidad extra para slider automático
      if (container.closest('.bestsellers')) {
        let interval = setInterval(() => {
          if (wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 10) {
            wrapper.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        }, 5000);

        wrapper.addEventListener('mouseenter', () => clearInterval(interval));
        wrapper.addEventListener('touchstart', () => clearInterval(interval), { passive: true });
      }
    }
  });
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
    if (filter) filterProducts(filter, e.target.closest('.products').querySelector('.carousel-track[data-section]'));
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

  // Track: Generate Lead (Checkout)
  trackEvent('generate_lead', {
    value: total,
    currency: 'USD',
    item_count: cart.length
  });
}

// ===== CATEGORY NAV =====
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });

  // Track Virtual Page View
  trackSectionView(sectionId);

  // Track: Navigation Click
  trackEvent('navigation_click', {
    section_id: sectionId
  });
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
