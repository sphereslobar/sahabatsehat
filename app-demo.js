// Main application JavaScript for recruitment verification app

class RecruitmentApp {
    constructor() {
        this.currentUser = null;
        this.sheetsData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUploadHandlers();
        this.loadGoogleSheetsAPI();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Data entry form
        const dataEntryForm = document.getElementById('dataEntryForm');
        if (dataEntryForm) {
            dataEntryForm.addEventListener('submit', (e) => this.handleDataEntry(e));
        }

        // NIK input formatting
        const nikInput = document.getElementById('nik');
        if (nikInput) {
            nikInput.addEventListener('input', (e) => this.formatNIKInput(e));
        }

        // Phone number input formatting
        const phoneInput = document.getElementById('nomorHP');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneInput(e));
        }
    }

    setupFileUploadHandlers() {
        const ktpFile = document.getElementById('ktpFile');
        const selfieFile = document.getElementById('selfieFile');

        if (ktpFile) {
            ktpFile.addEventListener('change', (e) => this.handleFileSelect(e, 'KTP'));
        }

        if (selfieFile) {
            selfieFile.addEventListener('change', (e) => this.handleFileSelect(e, 'SELFIE'));
        }
    }

    loadGoogleSheetsAPI() {
        // Google Sheets API is loaded via script tag in HTML
        // We'll implement the actual API calls here
        console.log('Google Sheets API ready');
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const nomorHP = ConfigUtils.formatPhoneNumber(document.getElementById('nomorHP').value);
        const tglLahir = document.getElementById('tglLahir').value;

        if (!ConfigUtils.validatePhoneNumber(nomorHP)) {
            this.showError(CONFIG.MESSAGES.PHONE_INVALID);
            return;
        }

        this.showLoading(true);

        try {
            const userData = await this.findUserInSheets(nomorHP, tglLahir);
            
            if (userData) {
                this.currentUser = userData;
                this.showSuccess(CONFIG.MESSAGES.SUCCESS_LOGIN);
                
                // Check if user has already completed data entry
                if (userData.nik && userData.ktpUrl && userData.selfieUrl) {
                    this.showProfile();
                } else {
                    this.showSection('dataEntrySection');
                }
            } else {
                this.showError(CONFIG.MESSAGES.LOGIN_FAILED);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(CONFIG.MESSAGES.NETWORK_ERROR);
        } finally {
            this.showLoading(false);
        }
    }

    async findUserInSheets(nomorHP, tglLahir) {
        try {
            const range = ConfigUtils.getReadRange();
            const response = await this.makeGoogleSheetsRequest(range);
            
            if (response.values) {
                for (let i = 1; i < response.values.length; i++) { // Skip header row
                    const row = response.values[i];
                    const rowPhone = ConfigUtils.formatPhoneNumber(row[0] || '');
                    const rowDate = row[1] || '';
                    
                    if (rowPhone === nomorHP && rowDate === tglLahir) {
                        return {
                            rowIndex: i + 1,
                            nomorHP: row[0],
                            tglLahir: row[1],
                            nama: row[2] || '',
                            nik: row[3] || '',
                            desa: row[4] || '',
                            jadwalTest: row[5] || '',
                            lokasiTest: row[6] || '',
                            ktpUrl: row[7] || '',
                            selfieUrl: row[8] || '',
                            status: row[9] || ''
                        };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    async handleDataEntry(event) {
        event.preventDefault();
        
        const nik = document.getElementById('nik').value;
        const ktpFile = document.getElementById('ktpFile').files[0];
        const selfieFile = document.getElementById('selfieFile').files[0];

        // Validate NIK
        if (!ConfigUtils.validateNIK(nik)) {
            this.showError(CONFIG.MESSAGES.NIK_INVALID);
            return;
        }

        // Validate files
        if (!ktpFile || !selfieFile) {
            this.showError('Harap upload semua file yang diperlukan.');
            return;
        }

        if (!ConfigUtils.validateFileSize(ktpFile, 'KTP')) {
            this.showError(CONFIG.MESSAGES.FILE_TOO_LARGE.replace('{size}', '5'));
            return;
        }

        if (!ConfigUtils.validateFileSize(selfieFile, 'SELFIE')) {
            this.showError(CONFIG.MESSAGES.FILE_TOO_LARGE.replace('{size}', '3'));
            return;
        }

        if (!ConfigUtils.validateFileType(ktpFile, 'KTP') || !ConfigUtils.validateFileType(selfieFile, 'SELFIE')) {
            this.showError(CONFIG.MESSAGES.INVALID_FILE_TYPE);
            return;
        }

        this.showLoading(true);

        try {
            // Upload files to Google Drive
            const ktpUrl = await this.uploadFileToGoogleDrive(ktpFile, `KTP_${nik}_${Date.now()}`);
            const selfieUrl = await this.uploadFileToGoogleDrive(selfieFile, `SELFIE_${nik}_${Date.now()}`);

            // Update user data
            this.currentUser.nik = nik;
            this.currentUser.ktpUrl = ktpUrl;
            this.currentUser.selfieUrl = selfieUrl;
            this.currentUser.status = 'Completed';

            // Save to Google Sheets
            await this.updateUserInSheets();

            this.showSuccess(CONFIG.MESSAGES.SUCCESS_SAVE);
            this.showProfile();

        } catch (error) {
            console.error('Data entry error:', error);
            this.showError(CONFIG.MESSAGES.SAVE_FAILED);
        } finally {
            this.showLoading(false);
        }
    }

    async uploadFileToGoogleDrive(file, fileName) {
        // Simulated file upload - in real implementation, this would upload to Google Drive
        // For demo purposes, we'll create a placeholder URL
        return new Promise((resolve) => {
            setTimeout(() => {
                const fileUrl = `https://drive.google.com/file/d/placeholder_${fileName}/view`;
                resolve(fileUrl);
            }, 1000);
        });
    }

    async updateUserInSheets() {
        try {
            const range = ConfigUtils.getWriteRange(this.currentUser.rowIndex);
            const values = [[
                this.currentUser.nomorHP,
                this.currentUser.tglLahir,
                this.currentUser.nama,
                this.currentUser.nik,
                this.currentUser.desa,
                this.currentUser.jadwalTest,
                this.currentUser.lokasiTest,
                this.currentUser.ktpUrl,
                this.currentUser.selfieUrl,
                this.currentUser.status
            ]];

            await this.makeGoogleSheetsUpdateRequest(range, values);
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    }

    async makeGoogleSheetsRequest(range) {
        // Simulated Google Sheets API request
        // In real implementation, this would make actual API calls
        return new Promise((resolve) => {
            setTimeout(() => {
                // Sample data for demonstration
                resolve({
                    values: [
                        ['Nomor HP', 'Tanggal Lahir', 'Nama', 'NIK', 'Desa', 'Jadwal Test', 'Lokasi Test', 'KTP URL', 'Selfie URL', 'Status'],
                        ['081234567890', '1990-01-01', 'John Doe', '', 'Desa Contoh', '2024-01-15 10:00', 'Jakarta', '', '', 'Pending'],
                        ['081234567891', '1985-05-15', 'Jane Smith', '1234567890123456', 'Desa Lain', '2024-01-16 14:00', 'Bandung', 'https://drive.google.com/...', 'https://drive.google.com/...', 'Completed']
                    ]
                });
            }, 500);
        });
    }

    async makeGoogleSheetsUpdateRequest(range, values) {
        // Simulated Google Sheets update request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    }

    showProfile() {
        this.showSection('profileSection');
        this.renderProfile();
        this.generateQRCode();
    }

    renderProfile() {
        const profileData = document.getElementById('profileData');
        if (!profileData || !this.currentUser) return;

        profileData.innerHTML = `
            <div class="profile-item">
                <span class="profile-label">Nama:</span>
                <span class="profile-value">${this.currentUser.nama || 'Tidak tersedia'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Nomor HP:</span>
                <span class="profile-value">${this.currentUser.nomorHP}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Tanggal Lahir:</span>
                <span class="profile-value">${ConfigUtils.formatDate(this.currentUser.tglLahir)}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">NIK:</span>
                <span class="profile-value">${this.currentUser.nik || 'Belum diisi'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Desa:</span>
                <span class="profile-value">${this.currentUser.desa || 'Tidak tersedia'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Jadwal Test:</span>
                <span class="profile-value">${this.currentUser.jadwalTest || 'Belum ditentukan'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Lokasi Test:</span>
                <span class="profile-value">${this.currentUser.lokasiTest || 'Belum ditentukan'}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Status:</span>
                <span class="profile-value ${this.currentUser.status === 'Completed' ? 'text-success' : ''}">${this.currentUser.status || 'Pending'}</span>
            </div>
            <div class="qr-container">
                <h3>QR Code Verifikasi</h3>
                <div id="qrcode"></div>
                <p class="mt-2">Tunjukkan QR Code ini saat hari test</p>
            </div>
        `;
    }

    generateQRCode() {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer || !this.currentUser) return;

        // Clear previous QR code
        qrContainer.innerHTML = '';

        // Generate QR code with NIK data
        const qrData = JSON.stringify({
            nik: this.currentUser.nik,
            nama: this.currentUser.nama,
            jadwal: this.currentUser.jadwalTest,
            lokasi: this.currentUser.lokasiTest,
            generated: new Date().toISOString()
        });

        if (typeof QRCode !== 'undefined') {
            QRCode.toCanvas(qrContainer, qrData, {
                width: CONFIG.APP.QR_CODE.SIZE,
                errorCorrectionLevel: CONFIG.APP.QR_CODE.ERROR_CORRECTION
            }, (error) => {
                if (error) {
                    console.error('QR Code generation error:', error);
                    qrContainer.innerHTML = '<p class="text-error">Gagal membuat QR Code</p>';
                }
            });
        } else {
            qrContainer.innerHTML = '<p class="text-error">QR Code library tidak tersedia</p>';
        }
    }

    handleFileSelect(event, type) {
        const file = event.target.files[0];
        const uploadDisplay = event.target.nextElementSibling;
        
        if (file) {
            // Validate file
            if (!ConfigUtils.validateFileSize(file, type)) {
                this.showError(CONFIG.MESSAGES.FILE_TOO_LARGE.replace('{size}', type === 'KTP' ? '5' : '3'));
                event.target.value = '';
                return;
            }

            if (!ConfigUtils.validateFileType(file, type)) {
                this.showError(CONFIG.MESSAGES.INVALID_FILE_TYPE);
                event.target.value = '';
                return;
            }

            // Update display
            uploadDisplay.querySelector('span').textContent = file.name;
            uploadDisplay.querySelector('small').textContent = ConfigUtils.formatFileSize(file.size);
            uploadDisplay.querySelector('i').className = 'fas fa-check-circle';
            event.target.parentElement.classList.add('has-file');
        }
    }

    formatNIKInput(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, ''); // Remove non-digits
        
        if (value.length > 16) {
            value = value.substring(0, 16);
        }
        
        input.value = value;
    }

    formatPhoneInput(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, ''); // Remove non-digits
        
        // Ensure it starts with 0
        if (value && !value.startsWith('0')) {
            value = '0' + value;
        }
        
        input.value = value;
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    showError(message) {
        const modal = document.getElementById('errorModal');
        const messageElement = document.getElementById('errorMessage');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.classList.add('active');
        }
    }

    showSuccess(message) {
        const modal = document.getElementById('successModal');
        const messageElement = document.getElementById('successMessage');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.classList.add('active');
        }
    }

    logout() {
        this.currentUser = null;
        this.showSection('loginSection');
        
        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('dataEntryForm').reset();
        
        // Reset file uploads
        document.querySelectorAll('.file-upload').forEach(upload => {
            upload.classList.remove('has-file');
            const display = upload.querySelector('.file-upload-display');
            if (display) {
                display.querySelector('span').textContent = upload.querySelector('input').id === 'ktpFile' ? 
                    'Pilih file atau drag & drop' : 'Pilih foto selfie';
                display.querySelector('small').textContent = upload.querySelector('input').id === 'ktpFile' ? 
                    'Format: JPG, PNG, PDF (Max 5MB)' : 'Format: JPG, PNG (Max 3MB)';
                display.querySelector('i').className = upload.querySelector('input').id === 'ktpFile' ? 
                    'fas fa-cloud-upload-alt' : 'fas fa-camera';
            }
        });
    }

    downloadQR() {
        const canvas = document.querySelector('#qrcode canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `QRCode_${this.currentUser.nik || 'verification'}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionId) {
    if (window.app) {
        window.app.showSection(sectionId);
    }
}

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

function downloadQR() {
    if (window.app) {
        window.app.downloadQR();
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new RecruitmentApp();
}); 