// Configuration file for the recruitment verification app

const CONFIG = {
    // Google Sheets API Configuration
    GOOGLE_SHEETS: {
        // Replace with your Google Sheets API key
        // Example: 'AIzaSyC...' (get this from Google Cloud Console)
        API_KEY: 'AIzaSyDNlBQl1LPSWmPUhr8c4zGVuX6uFGtm5zs',
        
        // Replace with your Google Spreadsheet ID
        // You can find this in the URL of your Google Sheet
        // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
        // Example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
        SPREADSHEET_ID: '15SP2rOHLMoZ8dfxQFyLQvPKcezae6J_xAl7msVgkbco',
        
        // Sheet name where the data is stored - UPDATED for "Reviewed" sheet
        SHEET_NAME: 'Reviewed',
        
        // Column mappings for the Google Sheet - UPDATED for new structure
        COLUMNS: {
            NOMOR_HP: 'B',      // Phone number column (index 1) - "Nomor HP/WhatsApp aktif"
            TGL_LAHIR: 'I',     // Birth date column (index 8) - "Tanggal Lahir"
            NAMA: 'A',          // Name column (index 0) - "Nama Lengkap (Sesuai KTP)"
            NIK: 'W',           // NIK column (index 22) - will be added to the right of existing data
            DESA: 'F',          // Village column (index 5) - "Desa"
            JADWAL_TEST: 'X',   // Test schedule column (index 23) - will be added later
            LOKASI_TEST: 'Y',   // Test location column (index 24) - will be added later
            KTP_URL: 'Z',       // KTP/Domisili document URL column (index 25) - will be added later
            SELFIE_URL: 'AA',   // Selfie photo URL column (index 26) - will be added later
            STATUS: 'AB',       // Status column (index 27) - will be added later
            ENCRYPTED_ID: 'AC'  // Encrypted ID column (index 28) - combination of NIK and JADWAL_TEST
        }
    },

    // Google OAuth2 Configuration (for file uploads)
    GOOGLE_OAUTH2: {
        // Replace with your OAuth2 Client ID from Google Cloud Console
        // To get this: Go to Google Cloud Console > APIs & Services > Credentials
        // Create OAuth 2.0 Client ID for Web application
        // Example: '123456789-abc123def456.apps.googleusercontent.com'
        CLIENT_ID: '520702222198-fd3equtpkt5ite8sj4vonnoj4clmg4uf.apps.googleusercontent.com',
        
        // OAuth2 Scopes required for the app
        SCOPES: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
        ]
    },

    // Google Drive API Configuration (for file uploads)
    GOOGLE_DRIVE: {
        // Google Drive folder ID where files will be uploaded
        // To get this: Create a folder in Google Drive, open it, and copy the ID from the URL
        // Example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
        FOLDER_ID: '1IWAcF0GrsBWjY7LspgCzx6PL1OmHW1fM'
    },

    // App Configuration
    APP: {
        // Maximum file size for uploads (in bytes)
        MAX_FILE_SIZE: {
            KTP: 5 * 1024 * 1024,    // 5MB for KTP/Domisili
            SELFIE: 3 * 1024 * 1024  // 3MB for selfie
        },
        
        // Allowed file types
        ALLOWED_FILE_TYPES: {
            KTP: ['image/jpeg', 'image/png', 'application/pdf'],
            SELFIE: ['image/jpeg', 'image/png']
        },

        // Date format for display (Indonesian format)
        DATE_FORMAT: 'dd/mm/yyyy',
        
        // QR Code configuration
        QR_CODE: {
            SIZE: 200,
            ERROR_CORRECTION: 'M',
            TYPE: 'image/png'
        }
    },

    // API Endpoints
    API: {
        GOOGLE_SHEETS_BASE: 'https://sheets.googleapis.com/v4/spreadsheets',
        GOOGLE_DRIVE_BASE: 'https://www.googleapis.com/drive/v3',
        GOOGLE_UPLOAD_BASE: 'https://www.googleapis.com/upload/drive/v3'
    },

    // Error Messages
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

// Utility functions for configuration
const ConfigUtils = {
    /**
     * Encrypt data using a simple but reversible encryption
     * Note: This is not cryptographically secure, but sufficient for basic obfuscation
     */
    encryptData: function(data) {
        try {
            // Create a base string from data
            const baseString = typeof data === 'object' ? JSON.stringify(data) : String(data);
            
            // Convert to Base64 and reverse it
            const base64 = btoa(baseString);
            const reversed = base64.split('').reverse().join('');
            
            // Add a simple timestamp-based salt
            const salt = Date.now().toString(36);
            const encrypted = salt + '_' + reversed;
            
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    },

    /**
     * Decrypt the encrypted data
     */
    decryptData: function(encrypted) {
        try {
            // Remove the salt
            const [, reversedBase64] = encrypted.split('_');
            
            // Reverse back and decode
            const base64 = reversedBase64.split('').reverse().join('');
            const decrypted = atob(base64);
            
            // Try parsing as JSON if possible
            try {
                return JSON.parse(decrypted);
            } catch {
                return decrypted;
            }
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    },

    /**
     * Get the range for reading data from Google Sheets
     */
    getReadRange: function() {
        return `${CONFIG.GOOGLE_SHEETS.SHEET_NAME}!A:AB`;
    },

    /**
     * Get the range for writing data to a specific row (only updating user entry columns)
     */
    getWriteRange: function(rowNumber) {
        return `${CONFIG.GOOGLE_SHEETS.SHEET_NAME}!W${rowNumber}:AB${rowNumber}`;
    },

    /**
     * Format file size for display
     */
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Validate file size
     */
    validateFileSize: function(file, type) {
        const maxSize = type === 'KTP' ? CONFIG.APP.MAX_FILE_SIZE.KTP : CONFIG.APP.MAX_FILE_SIZE.SELFIE;
        return file.size <= maxSize;
    },

    /**
     * Validate file type
     */
    validateFileType: function(file, type) {
        const allowedTypes = type === 'KTP' ? CONFIG.APP.ALLOWED_FILE_TYPES.KTP : CONFIG.APP.ALLOWED_FILE_TYPES.SELFIE;
        return allowedTypes.includes(file.type);
    },

    /**
     * Format phone number
     */
    formatPhoneNumber: function(phone) {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        
        // Convert +62 to 0
        if (cleaned.startsWith('62')) {
            cleaned = '0' + cleaned.substring(2);
        }
        
        return cleaned;
    },

    /**
     * Format date for display in Indonesian format
     */
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
            // Standard dd/mm/yyyy format
            const dayFormatted = String(day).padStart(2, '0');
            const monthFormatted = String(month + 1).padStart(2, '0');
            return `${dayFormatted}/${monthFormatted}/${year}`;
        }
    },

    /**
     * Validate NIK format
     */
    validateNIK: function(nik) {
        // NIK should be exactly 16 digits
        const nikRegex = /^\d{16}$/;
        return nikRegex.test(nik);
    },

    /**
     * Validate phone number format
     */
    validatePhoneNumber: function(phone) {
        // Indonesian phone number format
        const phoneRegex = /^0\d{9,12}$/;
        return phoneRegex.test(phone);
    }
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigUtils };
} 