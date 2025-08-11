// Production version of the recruitment app with real Google APIs integration

class RecruitmentApp {
    constructor() {
        this.currentUser = null;
        this.sheetsData = [];
        this.gapi = null;
        this.tokenClient = null;
        this.accessToken = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUploadHandlers();
        this.loadGoogleAPIs();
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

        // Custom date picker setup
        this.setupCustomDatePicker();
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

    setupCustomDatePicker() {
        const dateInput = document.getElementById('tglLahir');
        const datePickerToggle = document.getElementById('datePickerToggle');
        const customDatePicker = document.getElementById('customDatePicker');
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        const currentMonth = document.getElementById('currentMonth');
        const dateGrid = document.getElementById('dateGrid');

        if (!dateInput || !datePickerToggle || !customDatePicker) return;

        this.currentDate = new Date();
        this.selectedDate = null;

        // Indonesian month names
        this.indonesianMonths = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        this.dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        // Input masking for DD/MM/YYYY
        dateInput.addEventListener('input', (e) => this.handleDateInput(e));
        dateInput.addEventListener('blur', (e) => this.validateDateInput(e));

        // Toggle date picker
        datePickerToggle.addEventListener('click', () => this.toggleDatePicker());
        dateInput.addEventListener('focus', () => this.showDatePicker());

        // Navigation buttons
        if (prevMonth) prevMonth.addEventListener('click', () => this.previousMonth());
        if (nextMonth) nextMonth.addEventListener('click', () => this.nextMonth());

        // Close picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!customDatePicker.contains(e.target) && 
                !datePickerToggle.contains(e.target) && 
                e.target !== dateInput) {
                this.hideDatePicker();
            }
        });

        this.renderCalendar();
    }

    handleDateInput(event) {
        let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
        
        // Add slashes at appropriate positions
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        if (value.length >= 5) {
            value = value.substring(0, 5) + '/' + value.substring(5, 9);
        }
        
        event.target.value = value;
    }

    validateDateInput(event) {
        const value = event.target.value;
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = value.match(dateRegex);
        
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const year = parseInt(match[3]);
            
            const date = new Date(year, month - 1, day);
            
            if (date.getDate() === day && 
                date.getMonth() === month - 1 && 
                date.getFullYear() === year &&
                year >= 1900 && year <= new Date().getFullYear()) {
                
                this.selectedDate = date;
                this.currentDate = new Date(date);
                this.renderCalendar();
                event.target.classList.remove('error');
            } else {
                event.target.classList.add('error');
            }
        } else if (value.length > 0) {
            event.target.classList.add('error');
        }
    }

    toggleDatePicker() {
        const customDatePicker = document.getElementById('customDatePicker');
        if (customDatePicker.classList.contains('active')) {
            this.hideDatePicker();
        } else {
            this.showDatePicker();
        }
    }

    showDatePicker() {
        const customDatePicker = document.getElementById('customDatePicker');
        customDatePicker.classList.add('active');
        this.renderCalendar();
    }

    hideDatePicker() {
        const customDatePicker = document.getElementById('customDatePicker');
        customDatePicker.classList.remove('active');
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    renderCalendar() {
        const currentMonth = document.getElementById('currentMonth');
        const dateGrid = document.getElementById('dateGrid');
        
        if (!currentMonth || !dateGrid) return;

        // Set month/year display
        currentMonth.textContent = `${this.indonesianMonths[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Clear previous calendar
        dateGrid.innerHTML = '';

        // Add day headers
        this.dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'date-picker-header-day';
            dayHeader.textContent = day;
            dateGrid.appendChild(dayHeader);
        });

        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        
        // Adjust to start on Sunday
        startDate.setDate(firstDay.getDate() - firstDay.getDay());

        // Generate calendar days
        for (let i = 0; i < 42; i++) { // 6 weeks max
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.className = 'date-picker-day';
            dayButton.textContent = date.getDate();
            
            // Add classes for styling
            if (date.getMonth() !== this.currentDate.getMonth()) {
                dayButton.classList.add('other-month');
            }
            
            if (this.isToday(date)) {
                dayButton.classList.add('today');
            }
            
            if (this.selectedDate && this.isSameDate(date, this.selectedDate)) {
                dayButton.classList.add('selected');
            }
            
            // Add click handler
            dayButton.addEventListener('click', () => this.selectDate(date));
            
            dateGrid.appendChild(dayButton);
        }
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        const dateInput = document.getElementById('tglLahir');
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        dateInput.value = `${day}/${month}/${year}`;
        dateInput.classList.remove('error');
        
        this.hideDatePicker();
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    isValidDateFormat(dateString) {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(dateRegex);
        
        if (!match) return false;
        
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        // Basic validation
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;
        
        // Check if date is valid (handles leap years, different month lengths)
        const date = new Date(year, month - 1, day);
        return date.getDate() === day && 
               date.getMonth() === month - 1 && 
               date.getFullYear() === year;
    }

    loadGoogleAPIs() {
        // Load Google APIs
        if (typeof gapi === 'undefined') {
            console.error('Google API library not loaded');
            return;
        }

        gapi.load('client', () => {
            gapi.client.init({
                apiKey: CONFIG.GOOGLE_SHEETS.API_KEY,
                discoveryDocs: [
                    'https://sheets.googleapis.com/$discovery/rest?version=v4',
                    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                ]
            }).then(() => {
                console.log('Google APIs initialized');
                this.gapi = gapi;
                
                // Initialize Google Identity Services
                this.initializeGoogleIdentity();
                
                // Check if client ID is configured
                if (CONFIG.GOOGLE_OAUTH2.CLIENT_ID === 'YOUR_OAUTH2_CLIENT_ID') {
                    console.warn('OAuth2 Client ID not configured. File upload will not work.');
                }
            }).catch((error) => {
                console.error('Error initializing Google APIs:', error);
                this.showError('Gagal menginisialisasi Google APIs');
            });
        });
    }

    initializeGoogleIdentity() {
        // Wait for Google Identity Services to load (it loads asynchronously)
        const checkGoogleIdentity = () => {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                try {
                    this.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: CONFIG.GOOGLE_OAUTH2.CLIENT_ID,
                        scope: CONFIG.GOOGLE_OAUTH2.SCOPES.join(' '),
                        callback: (response) => {
                            if (response.access_token) {
                                this.accessToken = response.access_token;
                                console.log('OAuth2 token received');
                            }
                        },
                    });
                    console.log('Google Identity Services initialized');
                } catch (error) {
                    console.error('Error initializing Google Identity Services:', error);
                }
            } else {
                // Retry after a short delay if Google Identity Services isn't loaded yet
                setTimeout(checkGoogleIdentity, 100);
            }
        };
        
        // Start checking for Google Identity Services
        checkGoogleIdentity();
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const nomorHP = ConfigUtils.formatPhoneNumber(document.getElementById('nomorHP').value);
        const tglLahirInput = document.getElementById('tglLahir').value;

        if (!ConfigUtils.validatePhoneNumber(nomorHP)) {
            this.showError(CONFIG.MESSAGES.PHONE_INVALID);
            return;
        }

        // Validate date format
        if (!tglLahirInput || !this.isValidDateFormat(tglLahirInput)) {
            this.showError('Format tanggal tidak valid. Gunakan DD/MM/YYYY.');
            return;
        }

        // Convert input date (DD/MM/YYYY) to standard format (YYYY-MM-DD) for comparison
        const tglLahir = this.convertInputDateToStandard(tglLahirInput);

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
            const response = await this.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                range: range
            });
            
            if (response.result.values) {
                console.log('📊 Raw spreadsheet data:', response.result.values);
                console.log('🔍 Looking for - Phone:', nomorHP, 'Date (converted):', tglLahir);
                
                for (let i = 1; i < response.result.values.length; i++) { // Skip header row
                    const row = response.result.values[i];
                    console.log(`🔍 Row ${i+1} raw data:`, row);
                    console.log(`🔍 Row ${i+1} length:`, row.length);
                    console.log(`🔍 Row ${i+1} date at index 8:`, row[8]);
                    
                    const rowPhone = ConfigUtils.formatPhoneNumber(row[1] || ''); // Column B (index 1) - "Nomor HP/WhatsApp aktif"
                    const rowDate = this.convertSpreadsheetDateToStandard(row[8] || ''); // Column I (index 8) - "Tanggal Lahir"
                    
                    console.log(`📋 Row ${i+1} - Phone: "${rowPhone}" vs "${nomorHP}" | Date: "${rowDate}" vs "${tglLahir}"`);
                    
                    if (rowPhone === nomorHP && rowDate === tglLahir) {
                        return {
                            rowIndex: i + 1,
                            nomorHP: row[1],        // Column B - Phone number
                            tglLahir: row[8],       // Column I - Birth date  
                            nama: row[0] || '',     // Column A - Name
                            nik: row[22] || '',     // Column W - NIK (empty for now)
                            desa: row[5] || '',     // Column F - Desa
                            jadwalTest: row[23] || '', // Column X - Test schedule (empty for now)
                            lokasiTest: row[24] || '', // Column Y - Test location (empty for now)
                            ktpUrl: row[25] || '',     // Column Z - KTP URL (empty for now)
                            selfieUrl: row[26] || '',  // Column AA - Selfie URL (empty for now)
                            status: row[27] || '',     // Column AB - Status (empty for now)
                            encryptedId: row[28] || ''   // Column AC - Encrypted ID
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

        // Check if OAuth2 is configured
        if (CONFIG.GOOGLE_OAUTH2.CLIENT_ID === 'YOUR_OAUTH2_CLIENT_ID' || 
            CONFIG.GOOGLE_DRIVE.FOLDER_ID === 'YOUR_GOOGLE_DRIVE_FOLDER_ID') {
            this.showError('Fitur upload file belum dikonfigurasi. Silakan hubungi administrator untuk melengkapi konfigurasi OAuth2 Client ID dan Google Drive Folder ID.');
            return;
        }

        // Check if Google Identity Services is available
        if (!this.tokenClient) {
            this.showError('Google Identity Services belum tersedia. Silakan refresh halaman dan coba lagi.');
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
            
            // Show more specific error messages
            if (error.message.includes('autentikasi') || error.message.includes('OAuth2')) {
                this.showError('Gagal melakukan autentikasi untuk upload file. ' + error.message);
            } else {
                this.showError(CONFIG.MESSAGES.SAVE_FAILED);
            }
        } finally {
            this.showLoading(false);
        }
    }

    async uploadFileToGoogleDrive(file, fileName) {
        try {
            // Create file metadata
            const metadata = {
                name: fileName,
                parents: [CONFIG.GOOGLE_DRIVE.FOLDER_ID]
            };

            // Convert file to base64
            const base64Data = await this.fileToBase64(file);
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            let body = delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + file.type + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

            // Upload to Google Drive
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + await this.getAccessToken(),
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: body
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            
            // Make file public (optional)
            await this.makeFilePublic(result.id);
            
            return `https://drive.google.com/file/d/${result.id}/view`;

        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    async getAccessToken() {
        try {
            // Check if OAuth2 is configured
            if (CONFIG.GOOGLE_OAUTH2.CLIENT_ID === 'YOUR_OAUTH2_CLIENT_ID') {
                throw new Error('OAuth2 Client ID not configured');
            }

            // Check if Google Identity Services is available
            if (!this.tokenClient) {
                throw new Error('Google Identity Services not initialized');
            }

            // If we already have a valid access token, return it
            if (this.accessToken) {
                return this.accessToken;
            }

            // Request access token using Google Identity Services
            return new Promise((resolve, reject) => {
                try {
                    this.tokenClient.callback = (response) => {
                        if (response.error) {
                            reject(new Error(response.error));
                            return;
                        }
                        
                        this.accessToken = response.access_token;
                        resolve(response.access_token);
                    };
                    
                    // Request access token
                    this.tokenClient.requestAccessToken({prompt: 'consent'});
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            console.error('Authentication error:', error);
            throw new Error('Gagal melakukan autentikasi. Pastikan OAuth2 Client ID sudah dikonfigurasi.');
        }
    }

    async makeFilePublic(fileId) {
        try {
            await this.gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
        } catch (error) {
            console.warn('Could not make file public:', error);
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result.split(',')[1];
                resolve(result);
            };
            reader.onerror = error => reject(error);
        });
    }

    async updateUserInSheets() {
        try {
            // Generate encrypted ID from NIK and JADWAL_TEST
            const dataToEncrypt = {
                nik: this.currentUser.nik,
                jadwalTest: this.currentUser.jadwalTest || 'unscheduled',
                timestamp: Date.now()
            };
            const encryptedId = ConfigUtils.encryptData(dataToEncrypt);
            this.currentUser.encryptedId = encryptedId;

            const range = ConfigUtils.getWriteRange(this.currentUser.rowIndex);
            const values = [[
                this.currentUser.nik,           // Column W - NIK
                this.currentUser.jadwalTest,    // Column X - Test schedule
                this.currentUser.lokasiTest,    // Column Y - Test location
                this.currentUser.ktpUrl,        // Column Z - KTP URL
                this.currentUser.selfieUrl,     // Column AA - Selfie URL
                this.currentUser.status,        // Column AB - Status
                encryptedId                     // Column AC - Encrypted ID
            ]];

            await this.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: values
                }
            });
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
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
                <span class="profile-value">${ConfigUtils.formatDate(this.currentUser.tglLahir, true)}</span>
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

        // Generate QR code with encrypted ID
        const qrData = this.currentUser.encryptedId;

        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(qrContainer, {
                    text: qrData,
                    width: CONFIG.APP.QR_CODE.SIZE,
                    height: CONFIG.APP.QR_CODE.SIZE,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (error) {
                console.error('QR Code generation error:', error);
                qrContainer.innerHTML = '<p class="text-error">Gagal membuat QR Code</p>';
            }
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
        this.accessToken = null; // Clear the access token
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

        // Revoke Google access token if available
        if (this.accessToken && typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
            try {
                google.accounts.oauth2.revoke(this.accessToken);
                console.log('Access token revoked');
            } catch (error) {
                console.warn('Could not revoke access token:', error);
            }
        }
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

    convertInputDateToStandard(dateString) {
        if (!dateString) return '';
        
        // Handle DD/MM/YYYY format from our custom input
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
        }
        
        return dateString;
    }

    convertSpreadsheetDateToStandard(dateString) {
        if (!dateString) return '';
        
        // Handle MM/DD/YYYY format from spreadsheet
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const month = parts[0].padStart(2, '0');
                const day = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
        }
        
        return dateString;
    }

    // Legacy function kept for backward compatibility
    convertDateFormat(dateString) {
        return this.convertSpreadsheetDateToStandard(dateString);
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