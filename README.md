# Sahabat Sehat - Platform Verifikasi Kandidat

Platform web untuk verifikasi dan rekrutmen kandidat yang terintegrasi dengan Google Sheets dan dapat di-hosting di GitHub Pages.

## 🌟 Fitur

- **Login dengan Nomor HP dan Tanggal Lahir** - Sistem autentikasi sederhana menggunakan data yang sudah ada
- **Upload Dokumen** - Upload KTP/Domisili dan foto selfie untuk verifikasi
- **Integrasi Google Sheets** - Data tersimpan dan terintegrasi dengan database Google Sheets
- **QR Code Generator** - Generate QR code unik berdasarkan NIK untuk verifikasi
- **Responsive Design** - UI modern dan responsif untuk semua perangkat
- **Real-time Validation** - Validasi format NIK, nomor HP, dan file upload

## 📋 Persyaratan

- Google Account dengan akses ke Google Sheets API
- Google Drive untuk penyimpanan file
- Repository GitHub untuk hosting
- Browser modern dengan JavaScript enabled

## 🚀 Setup dan Instalasi

### 1. Persiapan Google Sheets

1. **Buat Google Spreadsheet baru** dengan struktur kolom berikut:
   ```
   A: Nomor HP
   B: Tanggal Lahir  
   C: Nama
   D: NIK
   E: Desa
   F: Jadwal Test
   G: Lokasi Test
   H: KTP URL
   I: Selfie URL
   J: Status
   ```

2. **Isi data kandidat** yang sudah ada di kolom A (Nomor HP), B (Tanggal Lahir), dan kolom lainnya sesuai kebutuhan.

3. **Catat Spreadsheet ID** dari URL Google Sheets:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### 2. Setup Google APIs

1. **Buka Google Cloud Console** (https://console.cloud.google.com/)

2. **Buat project baru** atau pilih project yang sudah ada

3. **Aktifkan APIs yang diperlukan**:
   - Google Sheets API
   - Google Drive API

4. **Buat API Key**:
   - Pergi ke "Credentials" 
   - Klik "Create Credentials" > "API Key"
   - Catat API Key yang dibuat

5. **Setup Google Drive Folder**:
   - Buat folder di Google Drive untuk menyimpan file upload
   - Catat Folder ID dari URL:
     ```
     https://drive.google.com/drive/folders/FOLDER_ID
     ```

### 3. Konfigurasi Aplikasi

1. **Edit file `config.js`** dan ganti nilai berikut:
   ```javascript
   const CONFIG = {
       GOOGLE_SHEETS: {
           API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY', // Ganti dengan API Key Anda
           SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID', // Ganti dengan Spreadsheet ID
           SHEET_NAME: 'Sheet1' // Sesuaikan dengan nama sheet Anda
       },
       GOOGLE_DRIVE: {
           API_KEY: 'YOUR_GOOGLE_DRIVE_API_KEY', // Biasanya sama dengan Sheets API Key
           FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID' // Ganti dengan Folder ID Anda
       }
   };
   ```

### 4. Deployment ke GitHub Pages

1. **Upload ke GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPOSITORY_NAME.git
   git push -u origin main
   ```

2. **Aktifkan GitHub Pages**:
   - Pergi ke Settings > Pages di repository GitHub
   - Pilih Source: "Deploy from a branch"
   - Pilih Branch: "main"
   - Pilih Folder: "/ (root)"
   - Klik Save

3. **Akses aplikasi** di: `https://USERNAME.github.io/REPOSITORY_NAME`

## 💡 Cara Penggunaan

### Untuk Kandidat:

1. **Login** menggunakan nomor HP dan tanggal lahir yang sudah terdaftar
2. **Lengkapi data** dengan memasukkan NIK dan upload dokumen
3. **Lihat profil** dan QR code verifikasi setelah data tersimpan

### Untuk Admin:

1. **Kelola data kandidat** melalui Google Sheets
2. **Monitor status** verifikasi melalui kolom Status
3. **Akses file upload** melalui Google Drive

## 🔧 Kustomisasi

### Mengubah Struktur Data

Edit mapping kolom di `config.js`:
```javascript
COLUMNS: {
    NOMOR_HP: 'A',
    TGL_LAHIR: 'B',
    NAMA: 'C',
    // Tambahkan atau ubah kolom sesuai kebutuhan
}
```

### Mengubah Validasi

Edit fungsi validasi di `app.js` atau `config.js`:
```javascript
validateNIK: function(nik) {
    // Kustomisasi validasi NIK
},
validatePhoneNumber: function(phone) {
    // Kustomisasi validasi nomor HP
}
```

### Mengubah UI/Styling

Edit `styles.css` untuk mengubah tampilan sesuai branding Anda.

## 🛡️ Keamanan

- **API Key Protection**: Pertimbangkan untuk menggunakan environment variables
- **File Validation**: Aplikasi memvalidasi ukuran dan tipe file
- **Data Sanitization**: Input divalidasi sebelum disimpan
- **HTTPS Only**: Gunakan HTTPS untuk GitHub Pages

## 🔍 Troubleshooting

### Google Sheets API Error
- Pastikan API Key benar dan APIs sudah diaktifkan
- Periksa quota limit di Google Cloud Console
- Pastikan spreadsheet dapat diakses publik atau API key memiliki permission

### File Upload Error
- Periksa Google Drive folder permission
- Pastikan ukuran file tidak melebihi batas
- Validate format file yang didukung

### GitHub Pages Error
- Pastikan semua file sudah ter-commit
- Periksa console browser untuk error JavaScript
- Pastikan path file benar (case-sensitive)

## 📞 Dukungan

Untuk pertanyaan atau bantuan:
1. Periksa troubleshooting guide di atas
2. Buat issue di GitHub repository
3. Hubungi administrator sistem

## 📄 Lisensi

MIT License - silakan gunakan dan modifikasi sesuai kebutuhan.

---

**Dibuat untuk Sahabat Sehat Platform Recruitment** 