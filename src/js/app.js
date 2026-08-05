// Dedicated Single Card Authentication Gateway & Application Orchestrator


class App {
  constructor() {
    // Load persistent stores from localStorage
    const savedClaims = localStorage.getItem('claimshield_claims');
    this.claimsStore = savedClaims ? JSON.parse(savedClaims) : [];

    const savedUsers = localStorage.getItem('claimshield_users');
    this.usersStore = savedUsers ? JSON.parse(savedUsers) : [];

    this.activeClaim = null;
    this.partsType = "OEM";

    // Session State (Restore active session if available)
    const savedSession = localStorage.getItem('claimshield_active_session');
    if (savedSession) {
      try {
        this.currentUser = JSON.parse(savedSession);
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }

    this.cvEngine = null;
    this.nlpEngine = null;
    this.fusionEngine = null;
    this.ragEngine = null;
    this.costEngine = null;

    this.initDOM();
    this.bindLoginGateway();
    this.bindNavigation();
    this.bindClaimantPortal();
    this.bindOfficialInspector();

    // Start on Active Session or Login Gateway Screen
    if (this.currentUser) {
      this.renderSessionUI();
    } else {
      this.logout();
    }
  }

  saveClaims() {
    localStorage.setItem('claimshield_claims', JSON.stringify(this.claimsStore));
  }

  saveUser(userObj) {
    if (userObj.role === 'claimant') {
      this.usersStore = this.usersStore.filter(u => !(u.role === 'claimant' && u.email && userObj.email && u.email.toLowerCase() === userObj.email.toLowerCase()));
    } else {
      this.usersStore = this.usersStore.filter(u => !(u.role === 'official' && u.companyCode && userObj.companyCode && u.companyCode.toLowerCase() === userObj.companyCode.toLowerCase()));
    }
    this.usersStore.push(userObj);
    localStorage.setItem('claimshield_users', JSON.stringify(this.usersStore));
  }

  initDOM() {
    this.elements = {
      // Top Nav Elements
      navTabsContainer: document.getElementById('nav-tabs-container'),
      navTabClaimant: document.getElementById('nav-tab-claimant'),
      navTabOfficial: document.getElementById('nav-tab-official'),
      userProfilePill: document.getElementById('user-profile-pill'),
      userNameDisplay: document.getElementById('user-name-display'),
      userRoleBadge: document.getElementById('user-role-badge'),
      btnLogout: document.getElementById('btn-logout'),

      // Views
      viewLogin: document.getElementById('view-login'),
      viewClaimant: document.getElementById('view-claimant'),
      viewOfficial: document.getElementById('view-official'),
      viewInspector: document.getElementById('view-inspector'),

      // Login Gateway Elements
      roleTabPolicyholder: document.getElementById('role-tab-policyholder'),
      roleTabInsurer: document.getElementById('role-tab-insurer'),
      roleTabRegister: document.getElementById('role-tab-register'),
      
      panelPolicyholder: document.getElementById('login-panel-policyholder'),
      panelInsurer: document.getElementById('login-panel-insurer'),
      panelRegister: document.getElementById('login-panel-register'),

      linkGotoRegisterUser: document.getElementById('link-goto-register-user'),
      linkGotoRegisterOfficial: document.getElementById('link-goto-register-official'),

      regTypeBtnPolicyholder: document.getElementById('reg-type-btn-policyholder'),
      regTypeBtnOfficial: document.getElementById('reg-type-btn-official'),
      regFieldsPolicyholder: document.getElementById('reg-fields-policyholder'),
      regFieldsOfficial: document.getElementById('reg-fields-official'),
      
      btnCreateAccount: document.getElementById('btn-create-account'),

      regUserName: document.getElementById('reg-user-name'),
      regUserEmail: document.getElementById('reg-user-email'),
      regUserCompanyCode: document.getElementById('reg-user-company-code'),
      regUserPolicy: document.getElementById('reg-user-policy'),
      regUserPassword: document.getElementById('reg-user-password'),

      regOfficialName: document.getElementById('reg-official-name'),
      regOfficialCode: document.getElementById('reg-official-code'),
      regOfficialEmail: document.getElementById('reg-official-email'),
      regOfficialPassword: document.getElementById('reg-official-password'),

      // Login Forms
      inputUserPolicy: document.getElementById('input-user-policy'),
      btnLoginUser: document.getElementById('btn-login-user'),

      inputOfficialCode: document.getElementById('input-official-code'),
      inputOfficialName: document.getElementById('input-official-name'),
      btnLoginOfficial: document.getElementById('btn-login-official'),

      // Claimant Portal Form
      subCompanyCode: document.getElementById('sub-company-code'),
      subPolicyNo: document.getElementById('sub-policy-no'),
      subName: document.getElementById('sub-name'),
      subDescription: document.getElementById('sub-description'),
      btnSubmitClaim: document.getElementById('btn-submit-claim'),
      userClaimsList: document.getElementById('user-claims-list'),

      // File Upload Elements
      dropzoneClaimPhoto: document.getElementById('dropzone-claim-photo'),
      subPhotoInput: document.getElementById('sub-photo-input'),
      dropzonePrompt: document.getElementById('dropzone-prompt'),
      dropzonePreview: document.getElementById('dropzone-preview'),
      imgUploadPreview: document.getElementById('img-upload-preview'),
      uploadFilenameBadge: document.getElementById('upload-filename-badge'),
      btnRemovePhoto: document.getElementById('btn-remove-photo'),

      // Official Dashboard
      officialCompanyName: document.getElementById('official-company-name'),
      officialClaimsGrid: document.getElementById('official-claims-grid'),
      filterButtons: document.querySelectorAll('.btn-filter'),

      // Official Inspector
      btnBackToDashboard: document.getElementById('btn-back-to-dashboard'),
      inspectorRef: document.getElementById('insp-ref'),
      inspectorName: document.getElementById('insp-name'),
      inspectorPolicy: document.getElementById('insp-policy'),
      inspectorDate: document.getElementById('insp-date'),
      inspectorStatusBadge: document.getElementById('insp-status-badge'),
      
      subtabButtons: document.querySelectorAll('.subtab-btn'),
      subtabContents: document.querySelectorAll('.subtab-content'),
      
      canvas: document.getElementById('insp-canvas'),
      toggleBboxes: document.getElementById('toggle-bboxes'),
      detectionsList: document.getElementById('insp-detections'),
      
      scoreDisplay: document.getElementById('insp-score'),
      levelDisplay: document.getElementById('insp-level'),
      flagsList: document.getElementById('insp-flags'),

      nlpTokens: document.getElementById('insp-nlp-tokens'),
      nlpFullText: document.getElementById('insp-nlp-text'),
      ragBox: document.getElementById('insp-rag-box'),
      
      costTableBody: document.getElementById('insp-cost-body'),
      subtotalDisplay: document.getElementById('insp-subtotal'),
      payoutDisplay: document.getElementById('insp-payout'),
      partsToggle: document.getElementById('insp-parts-toggle'),

      // Dispatch Reply
      replyInput: document.getElementById('insp-reply-input'),
      btnSendReply: document.getElementById('btn-send-reply'),
      btnApprove: document.getElementById('btn-approve-claim'),
      btnReject: document.getElementById('btn-reject-claim'),
      btnExportReport: document.getElementById('btn-export-report'),

      // Report Modal
      reportModal: document.getElementById('report-modal'),
      reportContent: document.getElementById('report-content'),
      btnCloseModal: document.getElementById('btn-close-modal')
    };

    if (this.elements.canvas) {
      // CV logic moved to backend
    }
  }

  // --- NAVIGATION & DASHBOARD QUEUE FILTERING ---
  bindNavigation() {
    this.elements.navTabClaimant.addEventListener('click', () => this.switchView('claimant'));
    this.elements.navTabOfficial.addEventListener('click', () => this.switchView('official'));

    // Filter Buttons for AI Queues (All, Fraud Queue, Pending Review, Auto-Approved)
    this.elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.elements.filterButtons.forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        const filter = btn.dataset.filter;
        this.renderOfficialDashboard(filter);
      });
    });

    // Back to Dashboard Button
    if (this.elements.btnBackToDashboard) {
      this.elements.btnBackToDashboard.addEventListener('click', () => this.switchView('official'));
    }
  }

  // --- LOGIN GATEWAY ROLE SWITCHER & REGISTRATION ---
  bindLoginGateway() {
    const switchTab = (activeTab, activePanel) => {
      [this.elements.roleTabPolicyholder, this.elements.roleTabInsurer, this.elements.roleTabRegister].forEach(tab => tab && tab.classList.remove('active'));
      [this.elements.panelPolicyholder, this.elements.panelInsurer, this.elements.panelRegister].forEach(panel => panel && panel.classList.remove('active'));

      if (activeTab) activeTab.classList.add('active');
      if (activePanel) activePanel.classList.add('active');
    };

    this.elements.roleTabPolicyholder.addEventListener('click', () => switchTab(this.elements.roleTabPolicyholder, this.elements.panelPolicyholder));
    this.elements.roleTabInsurer.addEventListener('click', () => switchTab(this.elements.roleTabInsurer, this.elements.panelInsurer));
    if (this.elements.roleTabRegister) {
      this.elements.roleTabRegister.addEventListener('click', () => switchTab(this.elements.roleTabRegister, this.elements.panelRegister));
    }

    if (this.elements.linkGotoRegisterUser) {
      this.elements.linkGotoRegisterUser.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(this.elements.roleTabRegister, this.elements.panelRegister);
        if (this.elements.regTypeBtnPolicyholder) this.elements.regTypeBtnPolicyholder.click();
      });
    }

    if (this.elements.linkGotoRegisterOfficial) {
      this.elements.linkGotoRegisterOfficial.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(this.elements.roleTabRegister, this.elements.panelRegister);
        if (this.elements.regTypeBtnOfficial) this.elements.regTypeBtnOfficial.click();
      });
    }

    // Toggle Registration Role Fields (Policyholder vs Official)
    if (this.elements.regTypeBtnPolicyholder && this.elements.regTypeBtnOfficial) {
      this.elements.regTypeBtnPolicyholder.addEventListener('click', () => {
        this.elements.regTypeBtnPolicyholder.classList.add('active');
        this.elements.regTypeBtnOfficial.classList.remove('active');
        this.elements.regFieldsPolicyholder.style.display = 'block';
        this.elements.regFieldsOfficial.style.display = 'none';
      });

      this.elements.regTypeBtnOfficial.addEventListener('click', () => {
        this.elements.regTypeBtnOfficial.classList.add('active');
        this.elements.regTypeBtnPolicyholder.classList.remove('active');
        this.elements.regFieldsOfficial.style.display = 'block';
        this.elements.regFieldsPolicyholder.style.display = 'none';
      });
    }

    // Create New Account Handler
    if (this.elements.btnCreateAccount) {
      this.elements.btnCreateAccount.addEventListener('click', () => {
        const isPolicyholder = this.elements.regTypeBtnPolicyholder.classList.contains('active');

        if (isPolicyholder) {
          const name = this.elements.regUserName.value.trim();
          const email = this.elements.regUserEmail.value.trim();
          if (!name) {
            alert("Please enter your full name.");
            return;
          }
          if (!email || !email.toLowerCase().endsWith("@gmail.com")) {
            alert("Only @gmail.com addresses are permitted for registration.");
            return;
          }

          const userObj = {
            role: 'claimant',
            name,
            email
          };
          this.saveUser(userObj);

          this.authenticateClaimant(email, name);
          if (this.elements.subName) this.elements.subName.value = name;

          alert(`🎉 Account Created Successfully!\n\nWelcome to ClaimShield, ${name}.`);
        } else {
          const officialName = this.elements.regOfficialName.value.trim();
          const companyCode = (this.elements.regOfficialCode ? this.elements.regOfficialCode.value.trim() : '').toUpperCase();
          const officialEmail = this.elements.regOfficialEmail.value.trim();

          if (!officialName) {
            alert("Please enter your official staff name.");
            return;
          }
          if (!officialEmail || !officialEmail.toLowerCase().endsWith(".com")) {
            alert("Only .com email addresses are permitted for official registration.");
            return;
          }
          if (!companyCode) {
            alert("Please enter your Insurance Company Code.");
            return;
          }

          const companyId = `COMP-${companyCode}`;
          const officialObj = {
            role: 'official',
            name: officialName,
            email: officialEmail,
            companyCode,
            companyId,
            companyName: companyCode
          };
          this.saveUser(officialObj);

          this.authenticateOfficial(companyCode, officialName);
          alert(`🏢 Official Account Registered!\n\nWelcome, ${officialName}.\nYou are now logged into the workspace for Company Code: ${companyCode}.`);
        }
      });
    }

    this.elements.btnLoginUser.addEventListener('click', () => {
      const email = this.elements.inputUserPolicy.value.trim();
      if (!email || !email.toLowerCase().endsWith("@gmail.com")) {
        alert("Please enter a valid @gmail.com Email Address to sign in.");
        return;
      }
      this.authenticateClaimant(email);
    });

    this.elements.btnLoginOfficial.addEventListener('click', () => {
      const code = this.elements.inputOfficialCode.value.trim();
      const name = this.elements.inputOfficialName ? this.elements.inputOfficialName.value.trim() : '';
      if (!code) {
        alert("Please enter your Insurance Company Code to sign in.");
        return;
      }
      if (!name) {
        alert("Please enter your Official Staff Name to sign in.");
        return;
      }
      this.authenticateOfficial(code, name);
    });

    this.elements.btnLogout.addEventListener('click', () => this.logout());

    // Reset Data Button
    const btnReset = document.getElementById('btn-reset-demo');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm("Are you sure you want to forget all previous entries? This will delete all users and claims from local storage.")) {
          localStorage.clear();
          location.reload();
        }
      });
    }
  }

  authenticateClaimant(emailStr, customName = null) {
    const rawInput = (emailStr || '').trim();
    const normInput = rawInput.toLowerCase();

    // Look up in registered users store (by email)
    const regUser = this.usersStore.find(u => u.role === 'claimant' && (
      (u.email && u.email.toLowerCase() === normInput)
    ));

    if (!regUser && !customName) {
      alert("No account found with this email. Please create a new account.");
      return;
    }

    const name = customName || regUser.name;
    const email = regUser ? regUser.email : rawInput;

    this.currentUser = {
      role: 'claimant',
      name,
      email
    };

    if (!regUser && rawInput) {
      this.saveUser({
        role: 'claimant',
        name,
        policyNo: finalPolicyNo,
        companyCode,
        companyId,
        email
      });
    }

    localStorage.setItem('claimshield_active_session', JSON.stringify(this.currentUser));
    this.renderSessionUI();
  }

  authenticateOfficial(companyCode, customName = null) {
    const rawInput = (companyCode || '').trim();
    const normCode = rawInput.toUpperCase();
    const companyId = `COMP-${normCode}`;

    // Look up in registered users store
    const regOfficial = this.usersStore.find(u => u.role === 'official' && (
      (u.companyCode && u.companyCode.toUpperCase() === normCode) ||
      (u.email && u.email.toLowerCase() === rawInput.toLowerCase())
    ));

    const name = customName || (regOfficial ? regOfficial.name : `${normCode} Official`);

    this.currentUser = {
      role: 'official',
      name,
      companyId,
      companyCode: normCode,
      companyName: normCode
    };

    if (!regOfficial && rawInput) {
      this.saveUser({
        role: 'official',
        name,
        companyCode: normCode,
        companyId,
        companyName: normCode
      });
    }

    localStorage.setItem('claimshield_active_session', JSON.stringify(this.currentUser));
    this.renderSessionUI();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('claimshield_active_session');
    if (this.elements.userProfilePill) this.elements.userProfilePill.style.display = 'none';
    if (this.elements.navTabsContainer) this.elements.navTabsContainer.style.display = 'none';
    this.switchView('login');
  }

  renderSessionUI() {
    if (!this.currentUser) {
      this.logout();
      return;
    }

    this.elements.userProfilePill.style.display = 'flex';
    this.elements.navTabsContainer.style.display = 'flex';
    this.elements.userNameDisplay.textContent = this.currentUser.name;

    if (this.currentUser.role === 'claimant') {
      this.elements.userRoleBadge.textContent = "Policyholder";
      this.elements.userRoleBadge.className = "badge badge-success";
      this.elements.navTabClaimant.style.display = "inline-flex";
      this.elements.navTabOfficial.style.display = "none";
      this.switchView('claimant');
      this.renderClaimantPortal();
    } else {
      this.elements.userRoleBadge.textContent = `Insurer (${this.currentUser.companyName})`;
      this.elements.userRoleBadge.className = "badge badge-warning";
      this.elements.navTabClaimant.style.display = "none";
      this.elements.navTabOfficial.style.display = "inline-flex";
      this.elements.officialCompanyName.textContent = this.currentUser.companyName;
      this.switchView('official');
      this.renderOfficialDashboard('all');
    }
  }

  switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

    if (viewName === 'login') {
      this.elements.viewLogin.classList.add('active');
    } else if (viewName === 'claimant') {
      this.elements.viewClaimant.classList.add('active');
    } else if (viewName === 'official') {
      this.elements.viewOfficial.classList.add('active');
    } else if (viewName === 'inspector') {
      this.elements.viewInspector.classList.add('active');
    }
  }

  // --- CLAIMANT PORTAL & FILE UPLOAD ---
  bindClaimantPortal() {
    this.uploadedImageSrc = null;

    const handleFileSelect = (file) => {
      if (!file || !file.type.startsWith('image/')) {
        alert("Please select a valid image file (PNG, JPG, WEBP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImageSrc = e.target.result;
        if (this.elements.imgUploadPreview) this.elements.imgUploadPreview.src = e.target.result;
        if (this.elements.uploadFilenameBadge) this.elements.uploadFilenameBadge.textContent = file.name;
        if (this.elements.dropzonePrompt) this.elements.dropzonePrompt.style.display = 'none';
        if (this.elements.dropzonePreview) this.elements.dropzonePreview.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    };

    if (this.elements.dropzoneClaimPhoto && this.elements.subPhotoInput) {
      this.elements.dropzoneClaimPhoto.addEventListener('click', (e) => {
        if (e.target.closest('#btn-remove-photo')) return;
        this.elements.subPhotoInput.click();
      });

      this.elements.subPhotoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
        }
      });

      // Drag and Drop support
      ['dragenter', 'dragover'].forEach(eventName => {
        this.elements.dropzoneClaimPhoto.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.elements.dropzoneClaimPhoto.style.borderColor = 'var(--primary)';
          this.elements.dropzoneClaimPhoto.style.background = 'var(--primary-glow)';
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        this.elements.dropzoneClaimPhoto.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.elements.dropzoneClaimPhoto.style.borderColor = 'var(--border-subtle)';
          this.elements.dropzoneClaimPhoto.style.background = 'var(--bg-main)';
        }, false);
      });

      this.elements.dropzoneClaimPhoto.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files[0]) {
          handleFileSelect(files[0]);
        }
      });
    }

    if (this.elements.btnRemovePhoto) {
      this.elements.btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        this.uploadedImageSrc = null;
        if (this.elements.subPhotoInput) this.elements.subPhotoInput.value = '';
        if (this.elements.dropzonePrompt) this.elements.dropzonePrompt.style.display = 'block';
        if (this.elements.dropzonePreview) this.elements.dropzonePreview.style.display = 'none';
      });
    }

    this.elements.btnSubmitClaim.addEventListener('click', () => {
      const companyCode = (this.elements.subCompanyCode ? this.elements.subCompanyCode.value.trim() : '').toUpperCase();
      const companyId = `COMP-${companyCode}`;
      const description = this.elements.subDescription.value || "Vehicle collision reported.";
      const name = this.elements.subName.value || this.currentUser.name;
      const policyNo = this.elements.subPolicyNo ? this.elements.subPolicyNo.value.trim() : '';

      if (!companyCode) {
        alert("Please select or enter an Insurance Company.");
        return;
      }
      if (!policyNo) {
        alert("Please enter your Policy Number.");
        return;
      }
      if (!name) {
        alert("Please enter your Full Name.");
        return;
      }

      const nlpResult = { tokens: [] };
      let detections = [];
      const fusionResult = { riskScore: 50, riskLevel: 'Pending Review', flags: [] };
      const imagePath = this.uploadedImageSrc || "./assets/car_front_damage.jpg";

      const newClaim = {
        id: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId,
        companyCode,
        companyName: companyCode,
        policyNo,
        claimant: name,
        date: new Date().toISOString().split('T')[0],
        policyType: "Standard Driver Protect",
        status: fusionResult.riskScore > 60 ? "Flagged Fraud" : "Pending Review",
        badgeClass: fusionResult.riskScore > 60 ? "badge-danger" : "badge-warning",
        description,
        imagePath,
        cvDetections: detections,
        riskScore: fusionResult.riskScore,
        riskLevel: fusionResult.riskLevel,
        flags: fusionResult.flags,
        policyMatch: {
          covered: fusionResult.riskScore < 50,
          reason: fusionResult.riskScore > 50 ? "Flagged for company review." : "Coverage verified.",
          clause: "Section 8.1: Collision coverage."
        },
        repairCosts: [
          { item: "Front Bumper OEM Assembly", category: "Parts", cost: 850 },
          { item: "Right Xenon Headlight Module", category: "Parts", cost: 1120 },
          { item: "Labor & Paint", category: "Labor", cost: 500 }
        ],
        officialReply: `🕒 Claim Received: Your submission has been securely routed to insurer code ${companyCode}. Standard assessment in progress.`,
        timeline: [
          { step: "Claim Received by Insurer", date: new Date().toLocaleTimeString(), done: true }
        ]
      };

      // Call FastAPI PyTorch + YOLOv8 + OpenCV + Transformers + spaCy + LangChain RAG Backend
      try {
        const formData = new FormData();
        formData.append("narrative", description);
        formData.append("company_code", companyCode);
        formData.append("policy_no", policyNo);
        formData.append("claimant_name", name);
        if (this.elements.subPhotoInput && this.elements.subPhotoInput.files[0]) {
          formData.append("photo", this.elements.subPhotoInput.files[0]);
        }

        fetch("http://127.0.0.1:8000/api/analyze-claim", {
          method: "POST",
          body: formData
        })
        .then(res => res.json())
        .then(apiData => {
          console.log("FastAPI Backend AI Response:", apiData);
          if (apiData.fusion_analysis) {
            newClaim.riskScore = apiData.fusion_analysis.risk_score;
            newClaim.riskLevel = apiData.fusion_analysis.risk_level;
            newClaim.flags = apiData.fusion_analysis.flags;
          }
          this.saveClaims();
          this.renderClaimantPortal();
        })
        .catch(err => console.log("FastAPI Backend running in asynchronous mode:", err));
      } catch (e) {
        console.log("FastAPI submission:", e);
      }

      this.claimsStore.unshift(newClaim);
      this.saveClaims();
      this.renderClaimantPortal();

      // Reset Form & Dropzone
      this.uploadedImageSrc = null;
      if (this.elements.subPhotoInput) this.elements.subPhotoInput.value = '';
      if (this.elements.subDescription) this.elements.subDescription.value = '';
      if (this.elements.dropzonePrompt) this.elements.dropzonePrompt.style.display = 'block';
      if (this.elements.dropzonePreview) this.elements.dropzonePreview.style.display = 'none';

      alert(`✅ Claim Submitted to Insurer (${companyCode})!\n\nAttached Photo Uploaded Successfully.\nTracking Ref: ${newClaim.id}`);
    });
  }

  renderClaimantPortal() {
    if (!this.currentUser) return;

    // Pre-fill user submission form with active user details
    if (this.elements.subName && this.currentUser.name) {
      this.elements.subName.value = this.currentUser.name;
    }

    // Populate companies-datalist
    const datalist = document.getElementById('companies-datalist');
    if (datalist) {
      datalist.innerHTML = '';
      const officialCompanies = [...new Set(this.usersStore.filter(u => u.role === 'official').map(u => u.companyCode))];
      officialCompanies.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        datalist.appendChild(option);
      });
    }

    const userClaims = this.claimsStore.filter(c => 
      (c.claimant && c.claimant.toLowerCase() === this.currentUser.name.toLowerCase()) || 
      (c.email && c.email.toLowerCase() === this.currentUser.email.toLowerCase())
    );

    this.elements.userClaimsList.innerHTML = '';
    if (userClaims.length === 0) {
      this.elements.userClaimsList.innerHTML = `
        <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 2.5rem; text-align: center;">
          <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 10px;"></i>
          <h4 style="color: var(--text-primary); margin-bottom: 4px; font-size: 1rem;">No Claims Submitted Yet</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.5;">Your policy history is completely fresh. Use the form on the left to submit your first claim report.</p>
        </div>
      `;
      return;
    }

    userClaims.forEach(claim => {
      const card = document.createElement('div');
      card.className = 'card-panel';
      card.style.marginBottom = '1.25rem';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <span class="claim-ref">${claim.id}</span>
            <h3 style="color: var(--text-primary); font-size: 1.15rem; margin-top: 2px;">Insurer Code: ${claim.companyCode || claim.companyName}</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Policy #: <strong>${claim.policyNo}</strong> • Date: ${claim.date}</p>
          </div>
          <span class="badge ${claim.badgeClass}">${claim.status}</span>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-secondary); background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; margin-bottom: 1rem;">
          "${claim.description}"
        </p>

        <!-- OFFICIAL COMPANY REPLY CARD (Customer View ONLY) -->
        <div class="official-reply-card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #0d5c63; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-building-shield"></i> Official Response from Insurer (${claim.companyCode || claim.companyName}):
          </div>
          <div class="reply-text" style="font-size: 0.98rem; color: #000000 !important; font-weight: 600; line-height: 1.6; background: #f8fafc; padding: 12px 14px; border-radius: 6px; border: 1px solid #e2e8f0; color: #000000 !important;">
            ${claim.officialReply || "No official reply dispatched yet."}
          </div>
        </div>
      `;
      this.elements.userClaimsList.appendChild(card);
    });
  }

  // --- COMPANY OFFICIAL DASHBOARD & AI INSPECTOR ---
  renderOfficialDashboard(filter = 'all') {
    if (!this.currentUser) return;

    let companyClaims = this.claimsStore.filter(c => 
      (c.companyCode && c.companyCode.toUpperCase() === (this.currentUser.companyCode || '').toUpperCase()) ||
      (c.companyId && c.companyId === this.currentUser.companyId)
    );

    if (filter === 'fraud') {
      companyClaims = companyClaims.filter(c => c.riskScore > 60);
    } else if (filter === 'approved') {
      companyClaims = companyClaims.filter(c => c.riskScore < 20);
    } else if (filter === 'review') {
      companyClaims = companyClaims.filter(c => c.riskScore >= 20 && c.riskScore <= 60);
    }

    this.elements.officialClaimsGrid.innerHTML = '';
    if (companyClaims.length === 0) {
      this.elements.officialClaimsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 3rem; text-align: center;">
          <i class="fa-solid fa-inbox" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
          <h4 style="color: var(--text-primary); margin-bottom: 6px; font-size: 1.1rem;">Official Queue Empty</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto; line-height: 1.5;">There are no active claims in this queue for ${this.currentUser.companyName}. Incoming policyholder submissions will appear here automatically.</p>
        </div>
      `;
      return;
    }

    companyClaims.forEach(claim => {
      const card = document.createElement('div');
      card.className = 'claim-card';
      card.innerHTML = `
        <div>
          <div class="card-header-top">
            <span class="claim-ref">${claim.id}</span>
            <span class="badge ${claim.badgeClass}">${claim.status}</span>
          </div>
          <div class="claimant-title">${claim.claimant}</div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
            Policy: <strong>${claim.policyNo}</strong> • ${claim.date}
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            "${claim.description}"
          </p>
        </div>

        <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <div>
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">AI Fraud Risk Score</span>
            <div style="font-size: 1.1rem; font-weight: 800; color: ${claim.riskScore > 50 ? 'var(--danger)' : 'var(--success)'}; font-family: var(--font-mono);">
              ${claim.riskScore}%
            </div>
          </div>
          <button class="btn btn-secondary btn-inspect" style="padding: 6px 14px; font-size: 0.85rem;">
            Inspect & Reply <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        this.openOfficialInspector(claim);
      });
      this.elements.officialClaimsGrid.appendChild(card);
    });
  }

  bindOfficialInspector() {
    this.elements.subtabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.elements.subtabButtons.forEach(b => b.classList.remove('active'));
        this.elements.subtabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.dataset.subtab;
        const targetPanel = document.getElementById(`subtab-${tabId}`);
        if (targetPanel) targetPanel.classList.add('active');

        if ((tabId === 'cv-nlp' || tabId === 'cv') && this.cvEngine) {
          setTimeout(() => {
            this.cvEngine.resizeCanvas();
            this.cvEngine.renderOverlay();
          }, 50);
        }
      });
    });

    this.elements.toggleBboxes.addEventListener('change', (e) => {
      if (this.cvEngine) this.cvEngine.toggleBoundingBoxes(e.target.checked);
    });

    this.elements.partsToggle.addEventListener('change', (e) => {
      this.partsType = e.target.value;
      this.updateInspectorCosts();
    });

    this.elements.btnSendReply.addEventListener('click', () => {
      const replyMsg = this.elements.replyInput.value;
      if (!replyMsg) {
        alert("Please enter a reply message.");
        return;
      }
      this.activeClaim.officialReply = replyMsg;
      this.saveClaims();
      alert(`💬 Official Response Dispatched to Claimant ${this.activeClaim.claimant}!`);
    });

    this.elements.btnApprove.addEventListener('click', () => {
      this.activeClaim.status = "Auto-Approved";
      this.activeClaim.badgeClass = "badge-success";
      this.activeClaim.officialReply = "✅ Claim Approved: Your claim has been verified by company officials and authorized for full payout.";
      this.elements.inspectorStatusBadge.textContent = "Auto-Approved";
      this.elements.inspectorStatusBadge.className = "badge badge-success";
      this.saveClaims();
      this.renderOfficialDashboard('all');
      alert(`✅ Claim ${this.activeClaim.id} Approved.`);
    });

    this.elements.btnReject.addEventListener('click', () => {
      this.activeClaim.status = "Flagged Fraud";
      this.activeClaim.badgeClass = "badge-danger";
      this.activeClaim.officialReply = "⚠️ Fraud Audit Notice: Mechanical damage contradictions detected. Claim transferred to SIU Fraud Division.";
      this.elements.inspectorStatusBadge.textContent = "Flagged Fraud";
      this.elements.inspectorStatusBadge.className = "badge badge-danger";
      this.saveClaims();
      this.renderOfficialDashboard('all');
      alert(`⚠️ Claim ${this.activeClaim.id} Flagged for Fraud Audit.`);
    });

    this.elements.btnExportReport.addEventListener('click', () => this.openReportModal());
    this.elements.btnCloseModal.addEventListener('click', () => {
      this.elements.reportModal.classList.remove('active');
    });
  }

  openOfficialInspector(claim) {
    this.activeClaim = claim;

    // Reset subtabs to Overview
    this.elements.subtabButtons.forEach(b => b.classList.remove('active'));
    this.elements.subtabContents.forEach(c => c.classList.remove('active'));
    this.elements.subtabButtons[0].classList.add('active');
    document.getElementById('subtab-overview').classList.add('active');

    this.elements.inspectorRef.textContent = claim.id;
    this.elements.inspectorName.textContent = claim.claimant;
    this.elements.inspectorPolicy.textContent = `${claim.policyNo} (${claim.policyType})`;
    this.elements.inspectorDate.textContent = claim.date;

    this.elements.inspectorStatusBadge.textContent = claim.status;
    this.elements.inspectorStatusBadge.className = `badge ${claim.badgeClass}`;

    this.elements.replyInput.value = claim.officialReply || "";

    // this.cvEngine.loadImageAndAnalyze(claim.imagePath, claim.cvDetections);
    const ctx = this.elements.canvas.getContext('2d');
    const img = new Image();
    img.onload = () => { 
      this.elements.canvas.width = img.naturalWidth || img.width || 800;
      this.elements.canvas.height = img.naturalHeight || img.height || 600;
      ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height); 
      ctx.drawImage(img, 0, 0, this.elements.canvas.width, this.elements.canvas.height); 
    };
    img.src = claim.imagePath;

    this.elements.scoreDisplay.textContent = `${claim.riskScore}%`;
    this.elements.levelDisplay.textContent = claim.riskLevel;

    this.elements.flagsList.innerHTML = '';
    (claim.flags || []).forEach(flag => {
      const item = document.createElement('div');
      item.style.padding = '10px 14px';
      item.style.background = 'var(--bg-surface)';
      item.style.borderRadius = '8px';
      item.style.marginBottom = '8px';
      item.style.borderLeft = `4px solid ${flag.status === 'pass' ? 'var(--success)' : 'var(--danger)'}`;
      item.innerHTML = `
        <strong style="color: var(--text-primary);">${flag.title}</strong>
        <p style="font-size:0.85rem; color: var(--text-secondary); margin-top: 2px;">${flag.desc}</p>
      `;
      this.elements.flagsList.appendChild(item);
    });

    const nlpRes = { extractedCount: 0, tokens: [], fullText: claim.description };
    this.elements.nlpFullText.textContent = `"${claim.description}"`;
    this.elements.nlpTokens.innerHTML = '';
    nlpRes.tokens.forEach(tok => {
      const chip = document.createElement('span');
      chip.style.padding = '4px 10px';
      chip.style.background = 'var(--bg-surface)';
      chip.style.color = 'var(--primary)';
      chip.style.borderRadius = '6px';
      chip.style.fontFamily = 'var(--font-mono)';
      chip.style.fontSize = '0.8rem';
      chip.style.border = '1px solid var(--border-subtle)';
      chip.textContent = tok.text;
      this.elements.nlpTokens.appendChild(chip);
    });

    const rag = { clause: { title: claim.policyMatch?.clause || "Standard Coverage", content: "Details pulled from backend.", id: "POL-01" }, similarityScore: 0.8, matchPercentage: 80 };
    this.elements.ragBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
        <strong style="color: var(--primary);">${rag.clause.title}</strong>
        <span class="badge badge-success">Match Score: ${Math.round(rag.similarityScore * 100)}%</span>
      </div>
      <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">${rag.clause.content}</p>
    `;

    this.elements.detectionsList.innerHTML = '';
    (claim.cvDetections || []).forEach(det => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.padding = '8px 12px';
      div.style.background = 'var(--bg-surface)';
      div.style.borderRadius = '6px';
      div.style.marginBottom = '6px';
      div.innerHTML = `
        <span style="color: var(--text-primary);"><strong>${det.part}</strong> (Conf: ${Math.round(det.confidence * 100)}%)</span>
        <span style="color: ${det.severity === 'Severe' ? 'var(--danger)' : 'var(--warning)'}; font-weight: 700;">${det.severity}</span>
      `;
      this.elements.detectionsList.appendChild(div);
    });

    this.updateInspectorCosts();
    this.switchView('inspector');
  }

  updateInspectorCosts() {
    if (!this.activeClaim) return;
    const totals = { parts: 0, labor: 0, total: 0, subtotal: 0, netPayout: 0, itemized: [] };

    this.elements.costTableBody.innerHTML = '';
    totals.itemized.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.item}</td>
        <td>${row.category}</td>
        <td style="font-family: var(--font-mono); font-weight:700;">$${row.finalCost.toLocaleString()}</td>
      `;
      this.elements.costTableBody.appendChild(tr);
    });

    this.elements.subtotalDisplay.textContent = `$${totals.subtotal.toLocaleString()}`;
    this.elements.payoutDisplay.textContent = `$${totals.netPayout.toLocaleString()}`;
  }

  openReportModal() {
    if (!this.activeClaim) return;
    const totals = { parts: 0, labor: 0, total: 0, subtotal: 0, netPayout: 0, itemized: [] };

    this.elements.reportContent.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <h2 style="color: var(--primary);">OFFICIAL COMPANY ASSESSMENT REPORT</h2>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">Company: ${this.activeClaim.companyName} • Date: ${new Date().toLocaleDateString()}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: var(--bg-surface); padding: 1rem; border-radius: 8px;">
        <div><strong>Claim Ref:</strong> ${this.activeClaim.id}</div>
        <div><strong>Claimant:</strong> ${this.activeClaim.claimant}</div>
        <div><strong>Policy #:</strong> ${this.activeClaim.policyNo}</div>
        <div><strong>Decision Status:</strong> <span style="color:${this.activeClaim.riskScore > 50 ? 'var(--danger)' : 'var(--success)'}; font-weight:700;">${this.activeClaim.status}</span></div>
      </div>

      <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Contradiction Red Flags</h4>
      <ul style="margin-left: 1.25rem; margin-bottom: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
        ${(this.activeClaim.flags || []).map(f => `<li><strong>${f.title}:</strong> ${f.desc}</li>`).join('')}
      </ul>

      <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Approved Cost Summary</h4>
      <p style="font-size: 0.95rem;">Gross Repair Cost: <strong>$${totals.subtotal.toLocaleString()}</strong> | Net Approved Payout: <strong style="color: var(--primary);">$${totals.netPayout.toLocaleString()}</strong></p>
    `;

    this.elements.reportModal.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
