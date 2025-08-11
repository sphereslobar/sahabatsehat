// Configuration file for the recruitment verification app

const CONFIG = {
    // Google Sheets API Configuration
    GOOGLE_SHEETS: {
        // Replace with your Google Sheets API key
        API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
        
        // Replace with your Google Spreadsheet ID
        SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
        
        // Sheet name where the data is stored
        SHEET_NAME: 'Reviewed',
        
        // Column mappings for the Google Sheet
        COLUMNS: {
            NOMOR_HP: 'B',
            TGL_LAHIR: 'I',
            NAMA: 'A',
            NIK: 'W',
            DESA: 'F',
            JADWAL_TEST: 'X',
            LOKASI_TEST: 'Y',
            KTP_URL: 'Z',
            SELFIE_URL: 'AA',
            STATUS: 'AB'
        }
    },

    // Google OAuth2 Configuration (for file uploads)
    GOOGLE_OAUTH2: {
        // Replace with your OAuth2 Client ID
        CLIENT_ID: 'YOUR_OAUTH2_CLIENT_ID',
        
        SCOPES: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
        ]
    },

    // Google Drive API Configuration (for file uploads)
    GOOGLE_DRIVE: {
        // Replace with your Google Drive folder ID
        FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID'
    },

    // Rest of the configuration remains the same
    APP: {
        MAX_FILE_SIZE: {
            KTP: 5 * 1024 * 1024,
            SELFIE: 3 * 1024 * 1024
        },
        
        ALLOWED_FILE_TYPES: {
            KTP: ['image/jpeg', 'image/png', 'application/pdf'],
            SELFIE: ['image/jpeg', 'image/png']
        },

        DATE_FORMAT: 'dd/mm/yyyy',
        
        QR_CODE: {
            SIZE: 200,
            ERROR_CORRECTION: 'M',
            TYPE: 'image/png'
        }
    },

    API: {
        GOOGLE_SHEETS_BASE: 'https://sheets.googleapis.com/v4/spreadsheets',
        GOOGLE_DRIVE_BASE: 'https://www.googleapis.com/drive/v3',
        GOOGLE_UPLOAD_BASE: 'https://www.googleapis.com/upload/drive/v3'
    },

    MESSAGES: {
        LOGIN_FAILED: 'Data login tidak ditemukan. Periksa kembali nomor HP dan tanggal lahir Anda.',
        UPLOAD_FAILED: 'Gagal mengunggah file. Silakan coba lagi.',
        SAVE_FAILED: 'Gagal menyimpan data. Silakan coba lagi.',
        FILE_TOO_LARGE: 'File terlalu besar. Maksimal {size}MB.',
        INVALID_FILE_TYPE: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF.',
        NETWORK_ERROR: 'Koneksi internet bermasalah. Silakan coba lagi.',
        NIK_INVALID: 'NIK harus terdiri dari 16 digit angka.',
        PHONE_INVALID: 'Format nomor HP tidak valid.',
        SUCCESS_SAVE: 'Data berhasil disimpan!',
        SUCCESS_LOGIN: 'Login berhasil!'
    }
};

// Utility functions remain the same
const ConfigUtils = {
    getReadRange: function() {
        return `${CONFIG.GOOGLE_SHEETS.SHEET_NAME}!A:AB`;
    },

    getWriteRange: function(rowNumber) {
        return `${CONFIG.GOOGLE_SHEETS.SHEET_NAME}!W${rowNumber}:AB${rowNumber}`;
    },

    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    validateFileSize: function(file, type) {
        const maxSize = type === 'KTP' ? CONFIG.APP.MAX_FILE_SIZE.KTP : CONFIG.APP.MAX_FILE_SIZE.SELFIE;
        return file.size <= maxSize;
    },

    validateFileType: function(file, type) {
        const allowedTypes = type === 'KTP' ? CONFIG.APP.ALLOWED_FILE_TYPES.KTP : CONFIG.APP.ALLOWED_FILE_TYPES.SELFIE;
        return allowedTypes.includes(file.type);
    },

    formatPhoneNumber: function(phone) {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('62')) {
            cleaned = '0' + cleaned.substring(2);
        }
        return cleaned;
    },

    formatDate: function(dateString, useIndonesianMonths = false) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        
        if (useIndonesianMonths) {
            const indonesianMonths = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            return `${day} ${indonesianMonths[month]} ${year}`;
        } else {
            const dayFormatted = String(day).padStart(2, '0');
            const monthFormatted = String(month + 1).padStart(2, '0');
            return `${dayFormatted}/${monthFormatted}/${year}`;
        }
    },

    validateNIK: function(nik) {
        const nikRegex = /^\d{16}$/;
        return nikRegex.test(nik);
    },

    validatePhoneNumber: function(phone) {
        const phoneRegex = /^0\d{9,12}$/;
        return phoneRegex.test(phone);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigUtils };
}
