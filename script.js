// Format to Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// State variables
let bahanCounter = 0;
let opCounter = 0;

// Render initial empty rows
document.addEventListener('DOMContentLoaded', () => {
    addBahanRow();
    addOpRow();
    calculateAll();

    // Update document title for Printing/Saving PDF
    const namaResepInput = document.getElementById('nama-resep');
    if (namaResepInput) {
        namaResepInput.addEventListener('input', (e) => {
            const title = e.target.value.trim();
            document.title = title ? `HPP - ${title}` : 'Kalkulator HPP Jualan';
        });
    }

    // Render saved lists
    renderSavedList();
});

// Calculate Row Bahan Cost
const calculateBahanRow = (id) => {
    const harga = parseFloat(document.getElementById(`bahan-harga-${id}`).value) || 0;
    const isi = parseFloat(document.getElementById(`bahan-isi-${id}`).value) || 0;
    const terpakai = parseFloat(document.getElementById(`bahan-terpakai-${id}`).value) || 0;

    let biaya = 0;
    if (isi > 0) {
        biaya = (harga / isi) * terpakai;
    }

    document.getElementById(`bahan-biaya-${id}`).value = formatRupiah(biaya);
    document.getElementById(`bahan-biaya-${id}`).setAttribute('data-value', biaya);

    calculateAll();
};

const addBahanRow = () => {
    bahanCounter++;
    const tbody = document.querySelector('#bahan-table tbody');
    const tr = document.createElement('tr');
    tr.id = `bahan-row-${bahanCounter}`;

    tr.innerHTML = `
        <td class="row-num"></td>
        <td><input type="text" placeholder="Cth: Telur" class="example-placeholder"></td>
        <td><input type="number" id="bahan-harga-${bahanCounter}" placeholder="Cth: 28000" oninput="calculateBahanRow(${bahanCounter})" class="example-placeholder" min="0"></td>
        <td>
            <select>
                <option value="gr">Gram (gr)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="ml">Mililiter (ml)</option>
                <option value="l">Liter (L)</option>
                <option value="pcs">Pcs/Buah</option>
            </select>
        </td>
        <td><input type="number" id="bahan-isi-${bahanCounter}" placeholder="Cth: 1000" oninput="calculateBahanRow(${bahanCounter})" class="example-placeholder" min="0"></td>
        <td><input type="number" id="bahan-terpakai-${bahanCounter}" placeholder="Cth: 200" oninput="calculateBahanRow(${bahanCounter})" class="example-placeholder" min="0"></td>
        <td><input type="text" id="bahan-biaya-${bahanCounter}" value="Rp 0" data-value="0" class="input-readonly" readonly></td>
        <td><button class="btn-danger" onclick="removeRow('bahan-row-${bahanCounter}')" title="Hapus">X</button></td>
    `;

    tbody.appendChild(tr);
    updateRowNumbers('bahan-table');
};

// Calculate Row Operasional Cost
const calculateOpRow = (id) => {
    const harga = parseFloat(document.getElementById(`op-harga-${id}`).value) || 0;
    const kapasitas = parseFloat(document.getElementById(`op-isi-${id}`).value) || 0;
    const terpakai = parseFloat(document.getElementById(`op-terpakai-${id}`).value) || 0;

    let biaya = 0;
    if (kapasitas > 0) {
        biaya = (harga / kapasitas) * terpakai;
    }

    document.getElementById(`op-biaya-${id}`).value = formatRupiah(biaya);
    document.getElementById(`op-biaya-${id}`).setAttribute('data-value', biaya);

    calculateAll();
}

const addOpRow = () => {
    opCounter++;
    const tbody = document.querySelector('#op-table tbody');
    const tr = document.createElement('tr');
    tr.id = `op-row-${opCounter}`;

    tr.innerHTML = `
        <td class="row-num"></td>
        <td><input type="text" placeholder="Cth: Mika Plastik" class="example-placeholder"></td>
        <td><input type="number" id="op-harga-${opCounter}" placeholder="Cth: 15000" oninput="calculateOpRow(${opCounter})" class="example-placeholder" min="0"></td>
        <td><input type="number" id="op-isi-${opCounter}" placeholder="Cth: 50" title="Isi dari satu pack kemasan" oninput="calculateOpRow(${opCounter})" class="example-placeholder" min="0"></td>
        <td><input type="number" id="op-terpakai-${opCounter}" placeholder="Cth: 1" value="1" oninput="calculateOpRow(${opCounter})" class="example-placeholder" min="0"></td>
        <td><input type="text" id="op-biaya-${opCounter}" value="Rp 0" data-value="0" class="input-readonly" readonly></td>
        <td><button class="btn-danger" onclick="removeRow('op-row-${opCounter}')" title="Hapus">X</button></td>
    `;

    tbody.appendChild(tr);
    updateRowNumbers('op-table');
}

const removeRow = (rowId) => {
    document.getElementById(rowId).remove();
    updateRowNumbers(rowId.includes('bahan') ? 'bahan-table' : 'op-table');
    calculateAll();
};

const updateRowNumbers = (tableId) => {
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach((row, index) => {
        row.querySelector('.row-num').textContent = index + 1;
    });
};

const calculateAll = () => {
    // 1. Calculate Total Bahan
    let totalBahan = 0;
    document.querySelectorAll('[id^="bahan-biaya-"]').forEach(input => {
        totalBahan += parseFloat(input.getAttribute('data-value')) || 0;
    });
    document.getElementById('total-bahan-text').textContent = formatRupiah(totalBahan);
    document.getElementById('final-bahan').value = formatRupiah(totalBahan);

    // 2. Calculate Total Operasional
    let totalOp = 0;
    document.querySelectorAll('[id^="op-biaya-"]').forEach(input => {
        totalOp += parseFloat(input.getAttribute('data-value')) || 0;
    });
    document.getElementById('total-op-text').textContent = formatRupiah(totalOp);
    document.getElementById('final-op').value = formatRupiah(totalOp);

    // 3. Calculate Total Produksi (HPP Resep)
    const totalProduksi = totalBahan + totalOp;
    document.getElementById('final-produksi').value = formatRupiah(totalProduksi);

    // 4. Calculate HPP per Produk
    const jumlahProduk = parseFloat(document.getElementById('jumlah-produk').value) || 1;
    let hppPerProduk = 0;
    if (jumlahProduk > 0) {
        hppPerProduk = totalProduksi / jumlahProduk;
    }
    document.getElementById('hpp-per-produk').value = formatRupiah(hppPerProduk);

    // 5. Calculate Saran Harga Jual
    const persenLaba = parseFloat(document.getElementById('persen-laba').value) || 0;
    const labaPerPcs = hppPerProduk * (persenLaba / 100);
    const saranHarga = hppPerProduk + labaPerPcs;
    const totalLabaResep = labaPerPcs * jumlahProduk;

    document.getElementById('saran-harga').value = formatRupiah(saranHarga);
    document.getElementById('laba-per-pcs').value = formatRupiah(labaPerPcs);
    document.getElementById('laba-per-resep').value = formatRupiah(totalLabaResep);

    // 6. Manual Override Check
    const hargaManual = parseFloat(document.getElementById('harga-jual-manual').value) || 0;
    if (hargaManual > 0) {
        const labaRiilPcs = hargaManual - hppPerProduk;
        const labaRiilTotal = labaRiilPcs * jumlahProduk;

        document.getElementById('laba-riil-pcs').value = formatRupiah(labaRiilPcs);
        document.getElementById('laba-riil-total').value = formatRupiah(labaRiilTotal);

        // Change color based on profit
        document.getElementById('laba-riil-pcs').style.color = labaRiilPcs >= 0 ? '#059669' : '#EF4444';
        document.getElementById('laba-riil-total').style.color = labaRiilTotal >= 0 ? '#059669' : '#EF4444';
    } else {
        document.getElementById('laba-riil-pcs').value = 'Rp 0';
        document.getElementById('laba-riil-total').value = 'Rp 0';
        document.getElementById('laba-riil-pcs').style.color = '#0284C7';
        document.getElementById('laba-riil-total').style.color = '#0284C7';
    }
};

// --- Local Storage Functions ---
const SAVE_KEY = 'hpp_saved_data';

const getSavedData = () => {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveCurrentData = () => {
    const namaResep = document.getElementById('nama-resep').value.trim();
    if (!namaResep) {
        alert('Silakan isi "Nama Produk / Resep" di bagian atas terlebih dahulu sebelum menyimpan.');
        document.getElementById('nama-resep').focus();
        return;
    }

    const bahanList = [];
    document.querySelectorAll('#bahan-table tbody tr').forEach(tr => {
        const idStr = tr.id;
        if (!idStr) return;
        const index = idStr.split('-')[2];
        const nama = tr.querySelector('td:nth-child(2) input').value;
        const harga = document.getElementById(`bahan-harga-${index}`) ? document.getElementById(`bahan-harga-${index}`).value : '';
        const satuan = tr.querySelector('td:nth-child(4) select').value;
        const isi = document.getElementById(`bahan-isi-${index}`) ? document.getElementById(`bahan-isi-${index}`).value : '';
        const terpakai = document.getElementById(`bahan-terpakai-${index}`) ? document.getElementById(`bahan-terpakai-${index}`).value : '';

        if (nama || harga || isi || terpakai) {
            bahanList.push({ nama, harga, satuan, isi, terpakai });
        }
    });

    const opList = [];
    document.querySelectorAll('#op-table tbody tr').forEach(tr => {
        const idStr = tr.id;
        if (!idStr) return;
        const index = idStr.split('-')[2];
        const nama = tr.querySelector('td:nth-child(2) input').value;
        const harga = document.getElementById(`op-harga-${index}`) ? document.getElementById(`op-harga-${index}`).value : '';
        const isi = document.getElementById(`op-isi-${index}`) ? document.getElementById(`op-isi-${index}`).value : '';
        const terpakai = document.getElementById(`op-terpakai-${index}`) ? document.getElementById(`op-terpakai-${index}`).value : '';

        if (nama || harga || isi || terpakai) {
            opList.push({ nama, harga, isi, terpakai });
        }
    });

    const hppData = {
        id: Date.now().toString(),
        namaResep,
        tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        jumlahProduk: document.getElementById('jumlah-produk').value,
        persenLaba: document.getElementById('persen-laba').value,
        hargaJualManual: document.getElementById('harga-jual-manual').value,
        bahanList,
        opList
    };

    let saved = getSavedData();
    const existingIndex = saved.findIndex(item => item.namaResep.toLowerCase() === namaResep.toLowerCase());

    if (existingIndex >= 0) {
        if (confirm(`Data dengan nama "${namaResep}" sudah ada. Timpa data lama?`)) {
            hppData.id = saved[existingIndex].id; // Keep old ID
            saved[existingIndex] = hppData;
        } else {
            return;
        }
    } else {
        saved.push(hppData);
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
    alert('Data berhasil disimpan ke browser perangkat!');
    renderSavedList();
};

const loadData = (id) => {
    const saved = getSavedData();
    const data = saved.find(item => item.id === id);
    if (!data) return;

    if (!confirm(`Muat data "${data.namaResep}"? Data di layar saat ini yang belum tersimpan akan terganti.`)) return;

    document.getElementById('nama-resep').value = data.namaResep;
    document.getElementById('jumlah-produk').value = data.jumlahProduk || 1;
    document.getElementById('persen-laba').value = data.persenLaba || 50;
    document.getElementById('harga-jual-manual').value = data.hargaJualManual || '';

    // Clear existing rows
    document.querySelector('#bahan-table tbody').innerHTML = '';
    document.querySelector('#op-table tbody').innerHTML = '';

    // Add new rows
    if (data.bahanList && data.bahanList.length > 0) {
        data.bahanList.forEach(item => {
            addBahanRow();
            const lastIndex = bahanCounter;
            const tr = document.getElementById(`bahan-row-${lastIndex}`);
            tr.querySelector('td:nth-child(2) input').value = item.nama;
            document.getElementById(`bahan-harga-${lastIndex}`).value = item.harga;
            tr.querySelector('td:nth-child(4) select').value = item.satuan || 'gr';
            document.getElementById(`bahan-isi-${lastIndex}`).value = item.isi;
            document.getElementById(`bahan-terpakai-${lastIndex}`).value = item.terpakai;
        });
    } else {
        addBahanRow();
    }

    if (data.opList && data.opList.length > 0) {
        data.opList.forEach(item => {
            addOpRow();
            const lastIndex = opCounter;
            const tr = document.getElementById(`op-row-${lastIndex}`);
            tr.querySelector('td:nth-child(2) input').value = item.nama;
            document.getElementById(`op-harga-${lastIndex}`).value = item.harga;
            document.getElementById(`op-isi-${lastIndex}`).value = item.isi;
            document.getElementById(`op-terpakai-${lastIndex}`).value = item.terpakai;
        });
    } else {
        addOpRow();
    }

    document.title = `HPP - ${data.namaResep}`;

    // Recalculate
    document.querySelectorAll('[id^="bahan-harga-"]').forEach((el) => {
        const idStr = el.id.replace('bahan-harga-', '');
        calculateBahanRow(idStr);
    });

    document.querySelectorAll('[id^="op-harga-"]').forEach((el) => {
        const idStr = el.id.replace('op-harga-', '');
        calculateOpRow(idStr);
    });

    calculateAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteData = (id) => {
    let saved = getSavedData();
    const data = saved.find(item => item.id === id);
    if (!data) return;

    if (confirm(`Yakin ingin menghapus data "${data.namaResep}" secara permanen?`)) {
        saved = saved.filter(item => item.id !== id);
        localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
        renderSavedList();
    }
};

const renderSavedList = () => {
    const saved = getSavedData();
    const card = document.getElementById('saved-hpp-card');
    const list = document.getElementById('saved-list');

    if (saved.length === 0) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';
    list.innerHTML = '';

    saved.forEach(item => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.innerHTML = `
            <h4>${item.namaResep}</h4>
            <span class="date">${item.tanggal}</span>
            <div class="saved-actions">
                <button class="btn btn-secondary btn-small" onclick="loadData('${item.id}')">📂 Buka</button>
                <button class="btn btn-danger btn-small" onclick="deleteData('${item.id}')">🗑️</button>
            </div>
        `;
        list.appendChild(div);
    });
};
