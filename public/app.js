document.addEventListener('DOMContentLoaded', () => {
    // DOM Elementleri
    const form = document.getElementById('sevkiyat-form');
    const editIdInput = document.getElementById('edit-id');
    const sevkiyatIdInput = document.getElementById('sevkiyat-id');
    const adSoyadInput = document.getElementById('ad-soyad');
    const toplamTutarInput = document.getElementById('toplam-tutar');
    const sevkEdenFirmaInput = document.getElementById('sevk-eden-firma');
    const sevkTarihiInput = document.getElementById('sevk-tarihi');
    const nakliyeUcretiInput = document.getElementById('nakliye-ucreti');
    const odemeKaynagiSelect = document.getElementById('odeme-kaynagi');
    const tabloBody = document.getElementById('sevkiyat-tablosu-body');
    const formBasligi = document.getElementById('form-basligi');
    const kaydetBtn = document.getElementById('kaydet-btn');
    const iptalBtn = document.getElementById('iptal-btn');
    const csvIndirBtn = document.getElementById('csv-indir-btn');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const dateFilterBtn = document.getElementById('date-filter-btn');
    const toplamSevkiyatEl = document.getElementById('toplam-sevkiyat');
    const toplamTutarEl = document.getElementById('ozet-toplam-tutar'); // DÜZELTİLDİ
    const ortalamaTutarEl = document.getElementById('ortalama-tutar');
    const ctx = document.getElementById('sevkiyat-grafigi').getContext('2d');
    
    let sevkiyatGrafigi;
    let tumSevkiyatlar = [];
    let aktifFiltre = 'all';

    const API_URL = 'http://localhost:3000/api/sevkiyatlar';

    const fetchAndRenderSevkiyatlar = async (startDate, endDate) => {
        try {
            let url = `${API_URL}?filter=${aktifFiltre}`;
            if (startDate && endDate) {
                url = `${API_URL}?startDate=${startDate}&endDate=${endDate}`;
                aktifFiltre = 'custom';
            }
            const response = await axios.get(url);
            tumSevkiyatlar = response.data;
            renderTable(tumSevkiyatlar);
            updateSummary(tumSevkiyatlar);
            updateChart(tumSevkiyatlar);
        } catch (error) {
            console.error('Veri alınırken hata oluştu:', error);
            tabloBody.innerHTML = `<tr><td colspan="6">Veriler yüklenemedi. Sunucunun çalıştığından emin olun.</td></tr>`;
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sevkiyatData = {
            sevkiyat_id: sevkiyatIdInput.value, ad_soyad: adSoyadInput.value,
            toplam_tutar: parseFloat(toplamTutarInput.value),
            sevk_eden_firma: sevkEdenFirmaInput.value, sevk_tarihi: sevkTarihiInput.value,
            nakliye_ucreti: parseFloat(nakliyeUcretiInput?.value || '0'),
            odeme_kaynagi: odemeKaynagiSelect?.value || null,
        };
        const editId = editIdInput.value;
        try {
            if (editId) await axios.put(`${API_URL}/${editId}`, sevkiyatData);
            else await axios.post(API_URL, sevkiyatData);
            fetchAndRenderSevkiyatlar();
            resetForm();
        } catch (error) { alert('Hata: ' + (error.response?.data?.error || error.message)); }
    });

    tabloBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;
        if (target.classList.contains('delete-btn')) {
            if (confirm('Bu sevkiyatı silmek istediğinizden emin misiniz?')) {
                axios.delete(`${API_URL}/${id}`).then(fetchAndRenderSevkiyatlar);
            }
        } else if (target.classList.contains('edit-btn')) {
            const sevkiyat = tumSevkiyatlar.find(s => s.id == id);
            if (sevkiyat) {
                editIdInput.value = sevkiyat.id; sevkiyatIdInput.value = sevkiyat.sevkiyat_id;
                adSoyadInput.value = sevkiyat.ad_soyad; toplamTutarInput.value = sevkiyat.toplam_tutar;
                sevkEdenFirmaInput.value = sevkiyat.sevk_eden_firma; sevkTarihiInput.value = sevkiyat.sevk_tarihi;
                if (nakliyeUcretiInput) nakliyeUcretiInput.value = sevkiyat.nakliye_ucreti ?? 0;
                if (odemeKaynagiSelect) odemeKaynagiSelect.value = sevkiyat.odeme_kaynagi || '';
                formBasligi.textContent = 'Sevkiyatı Düzenle'; kaydetBtn.textContent = 'Güncelle';
                iptalBtn.style.display = 'block'; window.scrollTo(0, 0);
            }
        }
    });

    filterButtonsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            aktifFiltre = e.target.dataset.filter;
            startDateInput.value = ''; endDateInput.value = '';
            fetchAndRenderSevkiyatlar();
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    dateFilterBtn.addEventListener('click', () => {
        const startDate = startDateInput.value; const endDate = endDateInput.value;
        if (!startDate || !endDate) return alert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
        if (startDate > endDate) return alert('Başlangıç tarihi, bitiş tarihinden sonra olamaz.');
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        fetchAndRenderSevkiyatlar(startDate, endDate);
    });

    csvIndirBtn.addEventListener('click', () => {
        if (tumSevkiyatlar.length === 0) return alert("İndirilecek veri bulunamadı.");
        const headers = "Sevkiyat ID,Ad Soyad,Toplam Tutar,Nakliye Ücreti,Ödeme Kaynağı,Sevk Eden Firma,Sevk Tarihi";
        const rows = tumSevkiyatlar.map(s => [
            s.sevkiyat_id,
            s.ad_soyad ?? '',
            s.toplam_tutar,
            s.nakliye_ucreti ?? 0,
            s.odeme_kaynagi ?? '',
            s.sevk_eden_firma ?? '',
            s.sevk_tarihi
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sevkiyat_raporu_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    const renderTable = (sevkiyatlar) => {
        tabloBody.innerHTML = '';
        if (sevkiyatlar.length === 0) {
            tabloBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Gösterilecek sevkiyat bulunamadı.</td></tr>';
            return;
        }
        sevkiyatlar.forEach(s => {
            tabloBody.innerHTML += `
                <tr>
                    <td>${s.sevkiyat_id}</td>
                    <td>${s.ad_soyad || '-'}</td>
                    <td>${s.toplam_tutar.toFixed(2)} ₺</td>
                    <td>${(parseFloat(s.nakliye_ucreti||0)).toFixed(2)} ₺</td>
                    <td>${s.odeme_kaynagi || '-'}</td>
                    <td>${s.sevk_eden_firma || '-'}</td>
                    <td>${new Date(s.sevk_tarihi).toLocaleDateString('tr-TR')}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-id="${s.id}" title="Düzenle">✏️</button>
                        <button class="delete-btn" data-id="${s.id}" title="Sil">🗑️</button>
                    </td>
                </tr>`;
        });
    };

    const updateSummary = (sevkiyatlar) => {
        const sevkiyatSayisi = sevkiyatlar.length;
        const toplamTutar = sevkiyatlar.reduce((acc, s) => acc + parseFloat(s.toplam_tutar), 0);
        const ortalamaTutar = sevkiyatSayisi > 0 ? toplamTutar / sevkiyatSayisi : 0;
        toplamSevkiyatEl.textContent = sevkiyatSayisi;
        toplamTutarEl.textContent = `${toplamTutar.toFixed(2)} ₺`;
        ortalamaTutarEl.textContent = `${ortalamaTutar.toFixed(2)} ₺`;
    };

    const updateChart = (sevkiyatlar) => {
        const etiketler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        const veriSeti = Array(7).fill(0);
        sevkiyatlar.forEach(s => {
            const gunIndex = (new Date(s.sevk_tarihi).getDay() + 6) % 7;
            veriSeti[gunIndex] += parseFloat(s.toplam_tutar);
        });
        if (sevkiyatGrafigi) sevkiyatGrafigi.destroy();
        sevkiyatGrafigi = new Chart(ctx, {
            type: 'bar',
            data: { labels: etiketler, datasets: [{
                label: 'Günlük Toplam Tutar (₺)', data: veriSeti,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)', borderWidth: 1
            }]},
            options: { scales: { y: { beginAtZero: true } } }
        });
    };

    const resetForm = () => {
        form.reset();
        editIdInput.value = '';
        formBasligi.textContent = 'Yeni Sevkiyat Ekle';
        kaydetBtn.textContent = 'Kaydet';
        iptalBtn.style.display = 'none';
        if (nakliyeUcretiInput) nakliyeUcretiInput.value = '0';
        if (odemeKaynagiSelect) odemeKaynagiSelect.value = '';
    };

    iptalBtn.addEventListener('click', resetForm);
    fetchAndRenderSevkiyatlar();
});