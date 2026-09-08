const CATALOG = {
  "categories": [
    {
      "name": "15cm Resin Planters",
      "items": ["Anna", "Emma", "Casey", "Tina", "TC 15"]
    },
    {
      "name": "Small Resin Planters",
      "items": ["Evie", "Amy", "Ruby", "Lucy", "TC 8", "TC 6", "TC 5"]
    },
    {
      "name": "Fiberglass Planters",
      "items": [
        "Boston 110x50x80", "Boston 110x50x65", "Boston 110x50x50",
        "Boston With Feet 100x50x80", "Boston Feet 100x50x65", "Boston Feet 100x50x50",
        "Paris 100x38x80", "Paris 100x38x65", "Paris 100x38x50",
        "New Yorker 45x80", "New Yorker 45x65", "New Yorker 45x50",
        "Nile 36x80", "Nile 36x65", "Nile 36x50",
        "Everest Large 73x75", "Everest Medium 73x60",
        "Victoria Large 39x43", "Victoria Small 39x36",
        "Aurora 40cm", "Aurora 32cm", "Rio 33cm", "Sahara", "Sydney"
      ]
    },
    {
      "name": "Ceramic Planters",
      "items": ["Amazon", "Cairo 27cm", "Cairo 22cm", "Barcelona"]
    },
    {
      "name": "Mini Planters & More",
      "items": [
        "Groot Happy", "Groot Thinking", "Tree Stump", "Skull", "Cactus Planter",
        "Buddha", "Buddha Laughing", "Buddha Head", "Buddha Candle Holder", "Hands",
        "Bonsai Rectangle", "Bonsai Oval", "Texture Pot", "Texture Pot tapered",
        "Box Crate", "Square Large", "Square Medium", "Square Small", "Air plant",
        "Heart With Lid", "Heart", "Mushroom", "Frog", "Short Cactus", "Tall Cactus",
        "Gnome", "Mini Friend", "Mini Flower", "Mini Happy", "Mini Smile",
        "Mini Baby", "Mini Love", "Mini Hearts"
      ]
    },
    {
      "name": "Sticker Pots",
      "items": [
        "Grinch Amy", "Grinch Ruby", "Santa Belt Amy", "Santa Belt Ruby",
        "Reindier Wink Amy", "Reindier Wink Ruby", "Reindier Smile Ruby",
        "Reindier Smile Amy", "Faces Amy", "Faces Ruby"
      ]
    }
  ],
  "colors": [
    "White", "LightGrey", "DarkGrey", "Black", "BlackGlossy",
    "MountainStream", "Navy", "AloeLeaf", "DryGold", "Terracotta",
    "Primer", "Burned_Ash", "Desert_Sand", "Gold",
    "Groot_TC_Aloe_Black", "Tree_Stump_Black_TC", "Cactus_Planter", "Mike_Knows"
  ],
  "lineArtColors": [
    "LinArt_White", "LinArt_LightGrey", "LinArt_DarkGrey", "LinArt_Black",
    "LinArt_BlackGlossy", "LinArt_MountainStream", "LinArt_Navy",
    "LinArt_AloeLeaf", "LinArt_DryGold", "LinArt_CanyonWall", "LinArt_Gold"
  ]
};

let catalogData = CATALOG;
let orderItems = JSON.parse(localStorage.getItem('orderItems') || '[]');
let invoiceNumber = parseInt(localStorage.getItem('invoiceNumber') || '100', 10);
let pendingBuffer = null;
let pendingFileName = '';

const API_BASE = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadCatalog();
  populateCategories();
  populateColors();
  populateLineArt();

  document.getElementById('categorySelect').addEventListener('change', renderPlanterButtons);
  document.getElementById('generateBtn').addEventListener('click', generateOrder);

  renderPlanterButtons();
  renderOrderTable();
}

async function loadCatalog() {
  try {
    const res = await fetch(API_BASE + '/items');
    if (res.ok) {
      catalogData = await res.json();
    }
  } catch {
    // API not available, use embedded CATALOG
  }
}

async function saveCatalog() {
  try {
    await fetch(API_BASE + '/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catalogData)
    });
  } catch {
    // Save locally if API fails
  }
}

function populateCategories() {
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '';
  catalogData.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    sel.appendChild(opt);
  });
}

function populateColors() {
  const sel = document.getElementById('colorSelect');
  sel.innerHTML = '';
  catalogData.colors.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c.replace(/_/g, ' ');
    sel.appendChild(opt);
  });
}

function populateLineArt() {
  const sel = document.getElementById('lineArtSelect');
  sel.innerHTML = '<option value="">No Line Art</option>';
  catalogData.lineArtColors.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c.replace(/_/g, ' ');
    sel.appendChild(opt);
  });
}

function renderPlanterButtons() {
  const panel = document.getElementById('planterPanel');
  const catName = document.getElementById('categorySelect').value;
  const cat = catalogData.categories.find(c => c.name === catName);

  panel.innerHTML = '';
  if (!cat) return;

  cat.items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'planter-btn';
    btn.textContent = item;
    btn.addEventListener('click', () => addToOrder(item));
    panel.appendChild(btn);
  });

  renderOrderTable();
}

function addToOrder(planterName) {
  const qty = parseInt(document.getElementById('quantityInput').value, 10);
  const color = document.getElementById('colorSelect').value;
  const lineArt = document.getElementById('lineArtSelect').value || '';
  const drilled = document.getElementById('drilledCheck').checked;

  if (!qty || qty <= 0) {
    alert('Please enter a valid quantity.');
    return;
  }
  if (!color) {
    alert('Please choose a colour.');
    return;
  }

  orderItems.push({
    planter: planterName,
    quantity: qty,
    color: color,
    lineArt: lineArt,
    drilled: drilled
  });

  saveOrder();
  document.getElementById('quantityInput').value = 1;
  renderOrderTable();
}

function renderOrderTable() {
  const tbody = document.getElementById('orderBody');
  tbody.innerHTML = '';

  if (orderItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No items added yet. Click a planter above to add it.</td></tr>';
    return;
  }

  orderItems.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.planter}</td>
      <td>${item.quantity}</td>
      <td>${item.color.replace(/_/g, ' ')}</td>
      <td>${item.lineArt ? item.lineArt.replace(/_/g, ' ') : '-'}</td>
      <td>${item.drilled ? 'Yes' : 'No'}</td>
      <td><button class="btn-remove" onclick="removeItem(${idx})">&times;</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function removeItem(idx) {
  orderItems.splice(idx, 1);
  saveOrder();
  renderOrderTable();
}

function clearOrder() {
  if (orderItems.length === 0) return;
  if (!confirm('Clear all items from the order?')) return;
  orderItems = [];
  saveOrder();
  renderOrderTable();
}

function saveOrder() {
  localStorage.setItem('orderItems', JSON.stringify(orderItems));
}

async function generateOrder() {
  if (orderItems.length === 0) {
    alert('No items to generate order for.');
    return;
  }

  const clientName = document.getElementById('clientName').value.trim();
  if (!clientName) {
    alert('Please enter the client name.');
    return;
  }

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;

  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Order Form');

    ws.columns = [
      { width: 28 },
      { width: 11 },
      { width: 27 },
      { width: 21 },
      { width: 10 }
    ];

    // Row 1: Client Name + Order #
    ws.getCell('A1').value = `Client Name: ${clientName}`;
    ws.getCell('A1').font = { bold: true, size: 16 };
    ws.getCell('A1').alignment = { horizontal: 'left' };

    ws.getCell('E1').value = `Order #: ${invoiceNumber}`;
    ws.getCell('E1').font = { bold: true, size: 16 };
    ws.getCell('E1').alignment = { horizontal: 'right' };

    // Row 2: Date
    ws.getCell('A2').value = `Date: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    ws.getCell('A2').font = { bold: true, size: 14 };
    ws.getCell('A2').alignment = { horizontal: 'left' };

    // Row 4: Headers with grey background
    const headers = ['Planter', 'Quantity', 'Colour', 'Line Art', 'Drilled'];
    headers.forEach((h, i) => {
      const cell = ws.getRow(4).getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, size: 16 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      cell.alignment = { horizontal: 'center' };
    });

    ws.getRow(5).height = 10;

    // Data rows
    let rowNum = 6;
    orderItems.forEach(item => {
      const row = ws.getRow(rowNum);
      row.getCell(1).value = item.planter;
      row.getCell(2).value = item.quantity;
      row.getCell(3).value = item.color.replace(/_/g, ' ');
      row.getCell(4).value = item.lineArt ? item.lineArt.replace(/_/g, ' ') : '';
      row.getCell(5).value = item.drilled ? 'Drilled' : '';

      for (let c = 1; c <= 5; c++) {
        row.getCell(c).font = { size: 16 };
        row.getCell(c).alignment = { horizontal: 'center' };
      }
      rowNum++;
    });

    // Item totals
    const totals = {};
    orderItems.forEach(item => {
      totals[item.planter] = (totals[item.planter] || 0) + item.quantity;
    });

    rowNum += 2;

    // Totals header with grey background
    const totalsHeader = ws.getRow(rowNum);
    totalsHeader.getCell(1).value = 'Item Totals';
    totalsHeader.getCell(1).font = { bold: true, size: 16 };
    totalsHeader.getCell(1).alignment = { horizontal: 'left' };
    totalsHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
    totalsHeader.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    rowNum++;

    Object.entries(totals).forEach(([name, qty]) => {
      const row = ws.getRow(rowNum);
      row.getCell(1).value = name;
      row.getCell(1).font = { size: 14 };
      row.getCell(1).alignment = { horizontal: 'left' };
      row.getCell(2).value = qty;
      row.getCell(2).font = { bold: true, size: 14 };
      row.getCell(2).alignment = { horizontal: 'center' };
      rowNum++;
    });

    ws.pageSetup = { paperSize: 6, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1 };

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `${clientName}_${dateStr}_OrderForm_${invoiceNumber}.xlsx`;

    pendingBuffer = buffer;
    pendingFileName = fileName;

    document.getElementById('shareFileName').textContent = fileName;

    // Show share button if Web Share API is available
    const shareBtn = document.getElementById('shareBtn');
    shareBtn.style.display = navigator.share ? 'inline-flex' : 'none';

    document.getElementById('shareModal').style.display = 'flex';

    invoiceNumber++;
    localStorage.setItem('invoiceNumber', invoiceNumber.toString());

    // Clear order after successful generation
    orderItems = [];
    saveOrder();
    renderOrderTable();
  } finally {
    btn.disabled = false;
  }
}

window.removeItem = removeItem;
window.clearOrder = clearOrder;

async function shareFile() {
  if (!pendingBuffer) return;
  try {
    const file = new File([pendingBuffer], pendingFileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    await navigator.share({
      files: [file],
      title: pendingFileName
    });
  } catch (err) {
    if (err.name !== 'AbortError') {
      alert('Share failed. Try the Download button instead.');
    }
  }
}

function downloadFile() {
  if (!pendingBuffer) return;
  const blob = new Blob([pendingBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, pendingFileName);
}

function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
  pendingBuffer = null;
  pendingFileName = '';
}

window.shareFile = shareFile;
window.downloadFile = downloadFile;
window.closeShareModal = closeShareModal;