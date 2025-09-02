const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database('./sevkiyat_veritabani.db', (err) => {
    if (err) return console.error("Veritabanı bağlantı hatası:", err.message);
    console.log('SQLite veritabanına başarıyla bağlanıldı.');
});

const createTableSql = `
CREATE TABLE IF NOT EXISTS sevkiyatlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sevkiyat_id TEXT UNIQUE NOT NULL,
    ad_soyad TEXT,
    toplam_tutar REAL NOT NULL,
    sevk_eden_firma TEXT,
    sevk_tarihi TEXT NOT NULL
);`;
db.run(createTableSql);

// [GET] Sevkiyatları getir (Gelişmiş Filtreleme)
app.get('/api/sevkiyatlar', (req, res) => {
    const { filter, startDate, endDate } = req.query;
    let sql = "SELECT * FROM sevkiyatlar";
    let params = [];

    if (filter === 'this_week') {
        sql += " WHERE sevk_tarihi BETWEEN date('now', 'weekday 1', '-7 days') AND date('now', 'weekday 0', '+7 days')";
    } else if (startDate && endDate) {
        sql += " WHERE sevk_tarihi BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }
    
    sql += " ORDER BY sevk_tarihi DESC";

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// [POST] Yeni sevkiyat ekle
app.post('/api/sevkiyatlar', (req, res) => {
    const { sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi } = req.body;
    const sql = `INSERT INTO sevkiyatlar (sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi) VALUES (?,?,?,?,?)`;
    db.run(sql, [sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: `Bu Sevkiyat ID (${sevkiyat_id}) zaten kullanılıyor.` });
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

// [PUT] Bir sevkiyatı güncelle
app.put('/api/sevkiyatlar/:id', (req, res) => {
    const { sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi } = req.body;
    const sql = `UPDATE sevkiyatlar SET sevkiyat_id = ?, ad_soyad = ?, toplam_tutar = ?, sevk_eden_firma = ?, sevk_tarihi = ? WHERE id = ?`;
    db.run(sql, [sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi, req.params.id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: `Bu Sevkiyat ID (${sevkiyat_id}) zaten kullanılıyor.` });
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ message: 'Güncellenecek sevkiyat bulunamadı.' });
        res.json({ message: 'Sevkiyat başarıyla güncellendi.' });
    });
});

// [DELETE] Bir sevkiyatı sil
app.delete('/api/sevkiyatlar/:id', (req, res) => {
    const sql = 'DELETE FROM sevkiyatlar WHERE id = ?';
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Silinecek sevkiyat bulunamadı.' });
        res.json({ message: 'Sevkiyat başarıyla silindi.' });
    });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});