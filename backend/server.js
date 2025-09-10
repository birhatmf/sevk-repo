const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const dbPath = path.join(__dirname, 'sevkiyat_veritabani.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error("Veritabanı bağlantı hatası:", err.message);
    console.log('SQLite veritabanına başarıyla bağlanıldı. Yol:', dbPath);
});

const createTableSql = `
CREATE TABLE IF NOT EXISTS sevkiyatlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sevkiyat_id TEXT UNIQUE NOT NULL,
    ad_soyad TEXT,
    toplam_tutar REAL NOT NULL,
    sevk_eden_firma TEXT,
    sevk_tarihi TEXT NOT NULL,
    nakliye_ucreti REAL DEFAULT 0,
    odeme_kaynagi TEXT CHECK (odeme_kaynagi IN ('Firma','Müşteri'))
);`;
db.run(createTableSql);

// Var olan tabloda eksik sütunları ekle (SQLite'ta IF NOT EXISTS desteklenmediği için kontrol ederek ekliyoruz)
const ensureColumnExists = (tableName, columnName, columnDef) => {
    db.all(`PRAGMA table_info(${tableName});`, (err, rows) => {
        if (err) return console.error('PRAGMA hatası:', err.message);
        const exists = rows.some(r => r.name === columnName);
        if (!exists) {
            db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef};`, (alterErr) => {
                if (alterErr) return console.error(`Sütun ekleme hatası (${columnName}):`, alterErr.message);
                console.log(`Sütun eklendi: ${columnName}`);
            });
        }
    });
};

ensureColumnExists('sevkiyatlar', 'nakliye_ucreti', 'REAL DEFAULT 0');
ensureColumnExists('sevkiyatlar', 'odeme_kaynagi', "TEXT CHECK (odeme_kaynagi IN ('Firma','Müşteri'))");

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
    const { sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi, nakliye_ucreti, odeme_kaynagi } = req.body;
    const sql = `INSERT INTO sevkiyatlar (sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi, nakliye_ucreti, odeme_kaynagi) VALUES (?,?,?,?,?,?,?)`;
    db.run(sql, [sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi, nakliye_ucreti ?? 0, odeme_kaynagi || null], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: `Bu Sevkiyat ID (${sevkiyat_id}) zaten kullanılıyor.` });
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

// [PUT] Bir sevkiyatı güncelle
app.put('/api/sevkiyatlar/:id', (req, res) => {
    const { sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi, nakliye_ucreti, odeme_kaynagi } = req.body;
    const sql = `UPDATE sevkiyatlar SET sevkiyat_id = ?, ad_soyad = ?, toplam_tutar = ?, sevk_eden_firma = ?, sevk_tarihi = ?, nakliye_ucreti = ?, odeme_kaynagi = ? WHERE id = ?`;
    db.run(sql, [sevkiyat_id, ad_soyad, toplam_tutar, sevk_eden_firma, sevk_tarihi, nakliye_ucreti ?? 0, odeme_kaynagi || null, req.params.id], function(err) {
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