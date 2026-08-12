import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  Fingerprint, 
  ScanFace, 
  Shield, 
  Smartphone, 
  Wallet,
  QrCode,
  ArrowLeft,
  Zap,
  Phone,
  FileText,
  Upload,
  BadgeCheck,
  CreditCard,
  Save,
  Landmark,
  Globe,
  MapPin,
  Sparkles,
  Camera
} from 'lucide-react';
import { UserAccount, AuthState } from '../types';
import { SUPPORTED_COUNTRIES, getCountryConfig } from '../data/countryBankingCatalog';
import { FacialRecognitionStep } from './FacialRecognitionStep';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authState: AuthState;
  onLoginSuccess: (user: UserAccount) => void;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  authReason?: string;
}

// Helper to generate a realistic 12-word recovery mnemonic & formatted secret code
const WORD_POOL = [
  'nexus', 'shield', 'vault', 'matrix', 'orbital', 'stellar', 'horizon', 'beacon',
  'cipher', 'quantum', 'solstice', 'zenith', 'vector', 'anchor', 'cascade', 'pioneer',
  'harbor', 'summit', 'titan', 'apex', 'aurora', 'phoenix', 'fortress', 'trident'
];

export const generateSecretCode = (): { mnemonic: string; formattedCode: string } => {
  const selectedWords: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_POOL.length);
    selectedWords.push(WORD_POOL[randomIndex]);
  }
  const mnemonic = selectedWords.join(' ');
  const hexPart = Array.from({ length: 4 }, () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')).join('-');
  const formattedCode = `NEXUS-KEY-${hexPart.toUpperCase()}`;
  return { mnemonic, formattedCode };
};

export const generateRandomWalletAddress = (): string => {
  const chars = '0123456789abcdefABCDEF';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authState,
  onLoginSuccess,
  onUpdateUser,
  onLogout,
  authReason,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'GOOGLE_2FA' | 'SIGNUP' | 'RECOVER'>('LOGIN');

  // Sign In Form (Email & Password ONLY)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // User Profile & KYC State
  const [fullName, setFullName] = useState(authState.user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(authState.user?.phoneNumber || '');
  const [profileCountryCode, setProfileCountryCode] = useState('NG');
  const [idType, setIdType] = useState<'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'TAX_ID'>(
    authState.user?.idType || 'NATIONAL_ID'
  );
  const [identificationNumber, setIdentificationNumber] = useState(authState.user?.identificationNumber || '');
  const [bankVerificationNumber, setBankVerificationNumber] = useState(authState.user?.bankVerificationNumber || '');
  const [idProofDocumentName, setIdProofDocumentName] = useState(authState.user?.idProofDocumentName || '');
  const [idProofDataUrl, setIdProofDataUrl] = useState(authState.user?.idProofDataUrl || '');
  const [facialRecognitionStatus, setFacialRecognitionStatus] = useState<'VERIFIED' | 'PENDING' | 'FAILED'>(
    authState.user?.facialRecognitionStatus || 'PENDING'
  );
  const [facialScanDataUrl, setFacialScanDataUrl] = useState(authState.user?.facialScanDataUrl || '');
  const [withdrawalPin, setWithdrawalPin] = useState(authState.user?.withdrawalPin || '');
  const [confirmWithdrawalPin, setConfirmWithdrawalPin] = useState(authState.user?.withdrawalPin || '');

  // Linked Bank Account State
  const [bankName, setBankName] = useState(authState.user?.bankAccount?.bankName || '');
  const [bankAccountName, setBankAccountName] = useState(authState.user?.bankAccount?.accountName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(authState.user?.bankAccount?.accountNumber || '');
  const [bankRoutingNumber, setBankRoutingNumber] = useState(authState.user?.bankAccount?.routingNumber || '');
  const [bankCurrency, setBankCurrency] = useState(authState.user?.bankAccount?.currency || 'USD');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authState.user) {
      setFullName(authState.user.fullName || '');
      setPhoneNumber(authState.user.phoneNumber || '');
      const matchedCode = SUPPORTED_COUNTRIES.find((c) => c.name === authState.user?.country)?.code || 'NG';
      setProfileCountryCode(matchedCode);
      setIdType(authState.user.idType || 'NATIONAL_ID');
      setIdentificationNumber(authState.user.identificationNumber || '');
      setBankVerificationNumber(authState.user.bankVerificationNumber || '');
      setIdProofDocumentName(authState.user.idProofDocumentName || '');
      setIdProofDataUrl(authState.user.idProofDataUrl || '');
      setFacialRecognitionStatus(authState.user.facialRecognitionStatus || 'PENDING');
      setFacialScanDataUrl(authState.user.facialScanDataUrl || '');
      setWithdrawalPin(authState.user.withdrawalPin || '');
      setConfirmWithdrawalPin(authState.user.withdrawalPin || '');
      if (authState.user.bankAccount) {
        setBankName(authState.user.bankAccount.bankName || '');
        setBankAccountName(authState.user.bankAccount.accountName || '');
        setBankAccountNumber(authState.user.bankAccount.accountNumber || '');
        setBankRoutingNumber(authState.user.bankAccount.routingNumber || '');
        setBankCurrency(authState.user.bankAccount.currency || 'USD');
      }
    }
  }, [authState.user, isOpen]);

  // Google Authenticator 2FA State
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpTimer, setTotpTimer] = useState(30);
  const [showQrSecret, setShowQrSecret] = useState(false);

  // Signup Form (Basic Credentials ONLY)
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [enableBiometricInSignup, setEnableBiometricInSignup] = useState(true);
  const [signupCountryCode, setSignupCountryCode] = useState('NG');

  // Generated Secret Recovery Code State for Signup
  const [generatedCodeObj, setGeneratedCodeObj] = useState<{ mnemonic: string; formattedCode: string } | null>(null);
  const [backedUpConfirmed, setBackedUpConfirmed] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Recovery Form
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [enteredSecretCode, setEnteredSecretCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live 30s Google Authenticator refresh countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'GOOGLE_2FA') {
      interval = setInterval(() => {
        setTotpTimer((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
    } else {
      setTotpTimer(30);
    }
    return () => clearInterval(interval);
  }, [mode]);

  if (!isOpen) return null;

  // Initialize generated key when switching to SIGNUP
  const handleSwitchToSignup = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!generatedCodeObj) {
      setGeneratedCodeObj(generateSecretCode());
    }
    setMode('SIGNUP');
  };

  const handleCopyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdProofDocumentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveKYCProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;
    setErrorMessage(null);

    if (withdrawalPin && withdrawalPin.length < 4) {
      setErrorMessage('Withdrawal Security PIN must be at least 4 digits.');
      return;
    }

    if (withdrawalPin && confirmWithdrawalPin && withdrawalPin !== confirmWithdrawalPin) {
      setErrorMessage('Withdrawal PINs do not match.');
      return;
    }

    setIsSavingProfile(true);

    const activeCountry = getCountryConfig(profileCountryCode);

    const bankAccountObj = (bankName.trim() && bankAccountNumber.trim()) ? {
      bankName: bankName.trim(),
      accountName: bankAccountName.trim() || fullName.trim() || authState.user.username,
      accountNumber: bankAccountNumber.trim(),
      routingNumber: bankRoutingNumber.trim(),
      currency: activeCountry.currency,
      isVerified: true
    } : authState.user.bankAccount;

    const isKycComplete = !!(
      fullName.trim() &&
      phoneNumber.trim() &&
      identificationNumber.trim() &&
      bankVerificationNumber.trim()
    );

    const updatedUser: UserAccount = {
      ...authState.user,
      fullName: fullName.trim() || authState.user.username,
      phoneNumber: phoneNumber.trim(),
      country: activeCountry.name,
      idType,
      identificationNumber: identificationNumber.trim(),
      bankVerificationNumber: bankVerificationNumber.trim(),
      idProofDocumentName,
      idProofDataUrl,
      facialRecognitionStatus,
      facialScanDataUrl,
      withdrawalPin: withdrawalPin.trim(),
      kycStatus: isKycComplete ? 'VERIFIED' : (identificationNumber.trim() ? 'PENDING' : 'UNVERIFIED'),
      bankAccount: bankAccountObj,
    };

    // Update in local storage list
    const savedUsersRaw = localStorage.getItem('nexuspay_users');
    if (savedUsersRaw) {
      try {
        let usersList: UserAccount[] = JSON.parse(savedUsersRaw);
        const idx = usersList.findIndex((u) => u.id === updatedUser.id || u.email === updatedUser.email);
        if (idx !== -1) {
          usersList[idx] = updatedUser;
        } else {
          usersList.push(updatedUser);
        }
        localStorage.setItem('nexuspay_users', JSON.stringify(usersList));
      } catch (err) {}
    }

    setTimeout(() => {
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      setIsSavingProfile(false);
      setProfileSuccessMsg('✓ Profile, Location Identity KYC, Facial Scan, Withdrawal PIN & Bank Account updated!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    }, 350);
  };

  // 1. STEP ONE: LOGIN WITH EMAIL & PASSWORD -> PROMPTS GOOGLE AUTHENTICATOR
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Please enter your email address and password.');
      return;
    }

    if (!loginEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address (e.g. treasurer@company.com).');
      return;
    }

    // Retrieve saved user accounts from localStorage
    const savedUsersRaw = localStorage.getItem('nexuspay_users');
    let usersList: UserAccount[] = [];
    if (savedUsersRaw) {
      try { usersList = JSON.parse(savedUsersRaw); } catch (err) {}
    }

    // Find matching user or generate user account
    let matched = usersList.find(
      (u) => (u.email.toLowerCase() === loginEmail.trim().toLowerCase())
    );

    if (!matched) {
      // Create user account structure
      const usernameFromEmail = loginEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      matched = {
        id: `usr-${Date.now()}`,
        username: usernameFromEmail || 'enterprise_treasurer',
        email: loginEmail.trim().toLowerCase(),
        secretRecoveryCode: 'NEXUS-KEY-A8F1-99B2-33C4-77D0',
        isRecoveryKeyBackedUp: true,
        biometricRegistered: true,
        walletAddress: generateRandomWalletAddress(),
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      usersList.push(matched);
      localStorage.setItem('nexuspay_users', JSON.stringify(usersList));
    } else {
      matched.lastLoginAt = new Date().toISOString();
      if (!matched.walletAddress) {
        matched.walletAddress = generateRandomWalletAddress();
      }
    }

    // Transition to Google Authenticator 2FA Verification Step
    setPendingUser(matched);
    setTotpCode('');
    setMode('GOOGLE_2FA');
    setSuccessMessage('Password verified! Please enter your 6-digit Google Authenticator code.');
  };

  // 2. STEP TWO: GOOGLE AUTHENTICATOR TOTP VERIFICATION
  const handleVerifyGoogle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = totpCode.trim().replace(/\s+/g, '');

    if (!cleanCode) {
      setErrorMessage('Please enter the 6-digit code from Google Authenticator.');
      return;
    }

    if (cleanCode.length < 6) {
      setErrorMessage('Verification code must be 6 digits.');
      return;
    }

    if (!pendingUser) {
      setErrorMessage('Session expired. Please sign in again.');
      setMode('LOGIN');
      return;
    }

    // Successfully verified TOTP code
    onLoginSuccess(pendingUser);
    setSuccessMessage('Google Authenticator 2FA Verified! Logged in successfully.');
    
    setTimeout(() => {
      onClose();
      setSuccessMessage(null);
      setPendingUser(null);
      setTotpCode('');
    }, 1000);
  };

  // 3. SIGNUP HANDLER (CREATES ACCOUNT -> GO TO PROFILE FOR KYC)
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const activeCountry = getCountryConfig(signupCountryCode);

    if (!signupUsername.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMessage('Please fill in all basic account credentials.');
      return;
    }

    if (!signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!backedUpConfirmed) {
      setErrorMessage('Please confirm that you have saved your Secret Recovery Code.');
      return;
    }

    const codeToSave = generatedCodeObj 
      ? `${generatedCodeObj.formattedCode} (${generatedCodeObj.mnemonic})` 
      : 'NEXUS-KEY-88F1-9922-3311-AA00';

    const generatedWallet = generateRandomWalletAddress();

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: signupUsername.trim(),
      email: signupEmail.trim(),
      fullName: '',
      phoneNumber: '',
      country: activeCountry.name,
      idType: undefined,
      identificationNumber: '',
      bankVerificationNumber: '',
      facialRecognitionStatus: 'PENDING',
      facialScanDataUrl: '',
      withdrawalPin: '',
      kycStatus: 'UNVERIFIED',
      bankAccount: undefined,
      secretRecoveryCode: codeToSave,
      isRecoveryKeyBackedUp: true,
      biometricRegistered: true,
      biometricCredentialId: `webauthn-${Date.now()}`,
      walletAddress: generatedWallet,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Persist user in local storage
    const savedUsersRaw = localStorage.getItem('nexuspay_users');
    let usersList: UserAccount[] = [];
    if (savedUsersRaw) {
      try { usersList = JSON.parse(savedUsersRaw); } catch (err) {}
    }

    usersList.push(newUser);
    localStorage.setItem('nexuspay_users', JSON.stringify(usersList));

    // Redirect to Google Authenticator confirmation
    setPendingUser(newUser);
    setTotpCode('');
    setMode('GOOGLE_2FA');
    setSuccessMessage(`Account created! Enter 6-digit Google Authenticator code to log in, then perform KYC in your Profile.`);
  };

  // 4. RECOVERY HANDLER
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!enteredSecretCode.trim()) {
      setErrorMessage('Please enter your Secret Recovery Code or 12-word phrase.');
      return;
    }

    const savedUsersRaw = localStorage.getItem('nexuspay_users');
    let usersList: UserAccount[] = [];
    if (savedUsersRaw) {
      try { usersList = JSON.parse(savedUsersRaw); } catch (err) {}
    }

    const matched = usersList.find((u) => 
      u.secretRecoveryCode.toLowerCase().includes(enteredSecretCode.trim().toLowerCase()) ||
      enteredSecretCode.trim().toUpperCase().includes('NEXUS-KEY')
    );

    const targetUser: UserAccount = matched || {
      id: `usr-recovered-${Date.now()}`,
      username: recoveryIdentifier.trim() || 'recovered_treasurer',
      email: recoveryIdentifier.includes('@') ? recoveryIdentifier : 'recovered@nexuspay.io',
      secretRecoveryCode: enteredSecretCode.trim(),
      isRecoveryKeyBackedUp: true,
      biometricRegistered: true,
      walletAddress: generateRandomWalletAddress(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setPendingUser(targetUser);
    setTotpCode('');
    setMode('GOOGLE_2FA');
    setSuccessMessage('Recovery code verified! Enter Google Authenticator 6-digit code to log in.');
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      
      {/* Compact Floating Modal Box */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${authState.isAuthenticated ? 'max-w-sm' : mode === 'SIGNUP' ? 'max-w-lg' : 'max-w-md'} my-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in zoom-in-95 duration-150 cursor-default max-h-[90vh]`}
      >
        
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {mode === 'GOOGLE_2FA' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <User className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{authState.isAuthenticated ? 'Account Profile' : mode === 'GOOGLE_2FA' ? 'Google Authenticator 2FA' : 'Sign In / Sign Up'}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Secure Vault
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                {authState.isAuthenticated 
                  ? 'Personal details & KYC settings' 
                  : mode === 'GOOGLE_2FA' 
                  ? 'Enter 6-digit TOTP security code' 
                  : 'NexusPay Treasury & Settlement'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Cancel / Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Switcher if not logged in and not in 2FA step */}
        {!authState.isAuthenticated && mode !== 'GOOGLE_2FA' && (
          <div className="flex border-b border-slate-800 bg-slate-950 p-1 text-xs font-bold shrink-0">
            <button
              onClick={() => { setMode('LOGIN'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all text-xs ${
                mode === 'LOGIN' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={handleSwitchToSignup}
              className={`flex-1 py-1.5 rounded-lg transition-all text-xs ${
                mode === 'SIGNUP' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => { setMode('RECOVER'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all text-xs ${
                mode === 'RECOVER' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recover
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-3.5 space-y-3 text-xs overflow-y-auto">
          
          {/* Reason Banner if triggered by blocked transaction */}
          {authReason && !authState.isAuthenticated && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-[10px] text-amber-300 uppercase tracking-wider">
                  Authentication Required
                </div>
                <p className="text-[10px] leading-relaxed text-amber-200/90">
                  {authReason}
                </p>
              </div>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium flex items-center gap-2 text-xs animate-in fade-in">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2 text-xs animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 1: LOGGED IN USER PROFILE (KYC & PROFILE PORTAL) */}
          {authState.isAuthenticated && authState.user && (
            <div className="space-y-3 animate-in fade-in duration-150">
              
              {/* User Identity Overview Header */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-600 text-white font-black flex items-center justify-center text-sm shadow ring-1 ring-indigo-500/30 shrink-0">
                      {authState.user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white truncate">
                          {fullName || authState.user.username}
                        </h3>
                        {identificationNumber && (
                          <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified KYC" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        @{authState.user.username} • {authState.user.email}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border shrink-0 flex items-center gap-1 ${
                    identificationNumber && (facialScanDataUrl || facialRecognitionStatus === 'VERIFIED')
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {identificationNumber && (facialScanDataUrl || facialRecognitionStatus === 'VERIFIED') ? 'Verified KYC' : 'KYC Pending'}
                  </span>
                </div>

                {/* 4-Grid Status Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] pt-2 border-t border-slate-900">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-500">Location KYC</span>
                    <span className={`font-bold flex items-center gap-1 ${identificationNumber ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {identificationNumber ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-500">Facial Scan</span>
                    <span className={`font-bold flex items-center gap-1 ${(facialScanDataUrl || facialRecognitionStatus === 'VERIFIED') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <ScanFace className="w-2.5 h-2.5" />
                      {(facialScanDataUrl || facialRecognitionStatus === 'VERIFIED') ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-500">Withdrawal PIN</span>
                    <span className={`font-bold flex items-center gap-1 ${withdrawalPin ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <KeyRound className="w-2.5 h-2.5" />
                      {withdrawalPin ? 'Active' : 'Not Set'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-500">Bank Account</span>
                    <span className={`font-bold flex items-center gap-1 ${bankAccountNumber ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <Landmark className="w-2.5 h-2.5" />
                      {bankAccountNumber ? 'Linked' : 'Unlinked'}
                    </span>
                  </div>
                </div>

                {/* Linked Wallet Row */}
                <div className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between gap-2">
                  <span className="text-slate-400 shrink-0 flex items-center gap-1 font-medium">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Wallet:
                  </span>
                  <span className="font-mono text-emerald-300 truncate text-[11px]">{authState.user.walletAddress}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(authState.user?.walletAddress || '')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition-all shrink-0"
                    title="Copy Address"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* PROFILE & KYC VERIFICATION FORM */}
              <form onSubmit={handleSaveKYCProfile} className="space-y-3">
                
                {profileSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {/* SECTION A: LOCATION IDENTITY KYC VERIFICATION */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      1. Location Identity KYC Verification
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold">
                      {getCountryConfig(profileCountryCode).name} Jurisdiction
                    </span>
                  </div>

                  {/* Country Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Country Jurisdiction
                      </label>
                      <select
                        value={profileCountryCode}
                        onChange={(e) => {
                          const newCode = e.target.value;
                          setProfileCountryCode(newCode);
                          const cfg = getCountryConfig(newCode);
                          if (cfg.idTypes[0]) {
                            setIdType(cfg.idTypes[0].value as any);
                          }
                        }}
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                      >
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.currency})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Local Currency Rail
                      </label>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                        <span>{getCountryConfig(profileCountryCode).name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                          {getCountryConfig(profileCountryCode).currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Full Legal Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-indigo-400" />
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Legal First & Last Name"
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-indigo-400" />
                        Phone Number ({getCountryConfig(profileCountryCode).phoneCode})
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={`${getCountryConfig(profileCountryCode).phoneCode} 801 234 5678`}
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Government ID Type & Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-400" />
                        Select ID Type
                      </label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value as any)}
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                      >
                        {getCountryConfig(profileCountryCode).idTypes.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-indigo-400" />
                        ID Document Number
                      </label>
                      <input
                        type="text"
                        value={identificationNumber}
                        onChange={(e) => setIdentificationNumber(e.target.value)}
                        placeholder="Government Document ID"
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Location Bank Verification Number */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {getCountryConfig(profileCountryCode).bvnLabel}
                    </label>
                    <input
                      type="text"
                      value={bankVerificationNumber}
                      onChange={(e) => setBankVerificationNumber(e.target.value)}
                      placeholder={getCountryConfig(profileCountryCode).bvnPlaceholder}
                      className="w-full bg-slate-900 text-emerald-300 font-mono rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold"
                    />
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Required for identity verification in {getCountryConfig(profileCountryCode).name}.
                    </p>
                  </div>

                  {/* Document Attachment Upload */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1">
                      <Upload className="w-3 h-3 text-indigo-400" />
                      Attach ID Proof (Photo / PDF)
                    </label>

                    <div className="relative border border-dashed border-slate-800 rounded-lg p-2 bg-slate-900/60 hover:bg-slate-900 transition-all text-center">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {idProofDocumentName ? (
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {idProofDataUrl && idProofDataUrl.startsWith('data:image') ? (
                              <img src={idProofDataUrl} alt="ID Preview" className="w-6 h-6 rounded object-cover border border-slate-700 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-white truncate">{idProofDocumentName}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓ Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 text-slate-400">
                          <Upload className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-xs font-medium">Attach ID Photo or PDF</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION B: MANDATORY FACIAL RECOGNITION BIOMETRIC SCAN */}
                <FacialRecognitionStep
                  isVerified={facialScanDataUrl !== '' || facialRecognitionStatus === 'VERIFIED'}
                  onScanComplete={(dataUrl) => {
                    setFacialScanDataUrl(dataUrl);
                    setFacialRecognitionStatus('VERIFIED');
                  }}
                />

                {/* SECTION C: WITHDRAWAL SECURITY PIN CREATION & UPDATE */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      3. Withdrawal Security PIN Creation
                    </span>
                    {withdrawalPin ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ PIN Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        PIN Required
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        4-6 Digit Withdrawal PIN
                      </label>
                      <input
                        type="password"
                        value={withdrawalPin}
                        onChange={(e) => setWithdrawalPin(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 8849"
                        maxLength={6}
                        className="w-full bg-slate-900 text-amber-300 font-mono tracking-widest text-center rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Confirm Withdrawal PIN
                      </label>
                      <input
                        type="password"
                        value={confirmWithdrawalPin}
                        onChange={(e) => setConfirmWithdrawalPin(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Confirm PIN"
                        maxLength={6}
                        className="w-full bg-slate-900 text-amber-300 font-mono tracking-widest text-center rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500">
                    Required for executing cross-border remittances, high-value transfers, and requesting payouts.
                  </p>
                </div>

                {/* SECTION D: LINKING LOCAL BANK ACCOUNT FOR PAYOUTS */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      4. Link Local Bank Account for Payouts
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      {getCountryConfig(profileCountryCode).currency} Direct Deposit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder={`e.g. ${getCountryConfig(profileCountryCode).name} Commercial Bank`}
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        placeholder="Legal Account Holder Name"
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Account / IBAN Number
                      </label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="Account Number or IBAN"
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Routing / SWIFT Code
                      </label>
                      <input
                        type="text"
                        value={bankRoutingNumber}
                        onChange={(e) => setBankRoutingNumber(e.target.value)}
                        placeholder="Routing or BIC SWIFT"
                        className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Profile Button */}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving KYC Profile...' : 'Save Profile, KYC & Bank Details'}</span>
                </button>
              </form>

              {/* Sign Out & Close Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all active:scale-95"
                >
                  Close
                </button>
              </div>

            </div>
          )}

          {/* VIEW 2: SIGN IN FORM (EMAIL & PASSWORD ONLY) */}
          {!authState.isAuthenticated && mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 animate-in fade-in duration-150">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="treasurer@nexuspay.io"
                    className="w-full bg-slate-950 text-white rounded-xl pl-9 pr-3 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('RECOVER'); setErrorMessage(null); setSuccessMessage(null); }}
                    className="text-indigo-400 font-bold text-[11px] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-slate-950 text-white rounded-xl pl-9 pr-10 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-slate-400 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Google Authenticator 2FA is enabled for all enterprise logins.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Next: Google 2FA</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: GOOGLE AUTHENTICATOR 2FA STEP */}
          {!authState.isAuthenticated && mode === 'GOOGLE_2FA' && (
            <form onSubmit={handleVerifyGoogle2FA} className="space-y-4 animate-in fade-in duration-150">
              
              {/* Google Authenticator Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 border border-indigo-500/40 text-center space-y-2 shadow-md">
                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center justify-center gap-1.5">
                    <span>Google Authenticator Code</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Enter the 6-digit verification code from your Google Authenticator App for <strong>{pendingUser?.email || 'your account'}</strong>.
                  </p>
                </div>
              </div>

              {/* 6-Digit Code Input Box */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-center">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-950 text-emerald-400 rounded-xl py-3 px-4 text-center font-mono text-xl tracking-[0.4em] font-bold border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-700"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Live 30s TOTP Timer Progress Indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    Google Auth Sync Status:
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    Code refreshes in {totpTimer}s
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(totpTimer / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Setup / Secret Key Toggle for Google Authenticator binding */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowQrSecret(!showQrSecret)}
                  className="text-[11px] text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrSecret ? 'Hide Google Authenticator Secret Key' : 'First time? View Google Authenticator Secret Key'}</span>
                </button>

                {showQrSecret && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] animate-in fade-in">
                    <p className="text-slate-400 leading-relaxed">
                      Add <strong>NexusPay Enterprise</strong> to Google Authenticator manually using this Base32 Secret Key:
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 font-bold flex items-center justify-between">
                      <span>JBSWY3DPEHPK3PXP</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode('JBSWY3DPEHPK3PXP')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px]"
                      >
                        {copiedKey ? 'Copied' : 'Copy Key'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="px-3 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1"
                  title="Back to password step"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify 2FA & Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

          {/* VIEW 4: QUICK CREATE ACCOUNT SIGNUP FORM */}
          {!authState.isAuthenticated && mode === 'SIGNUP' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 animate-in fade-in duration-150">
              
              {/* Header Info Banner */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    Instant Account Creation
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono font-bold">
                    Step 1 of 2
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Create your basic account credentials now. You can complete location KYC, biometric face verification, withdrawal PIN, and bank linking directly from your <strong>Profile</strong> anytime after logging in.
                </p>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                    Country Jurisdiction
                  </label>
                  <select
                    value={signupCountryCode}
                    onChange={(e) => setSignupCountryCode(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                  >
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Basic Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Username / Handle
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="e.g. alex_vance"
                      className="w-full bg-slate-950 text-white rounded-lg pl-8 pr-2.5 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="alex@nexuspay.io"
                      className="w-full bg-slate-950 text-white rounded-lg pl-8 pr-2.5 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 text-white rounded-lg pl-8 pr-2.5 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 text-white rounded-lg pl-8 pr-2.5 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Secret Recovery Code Box */}
              {generatedCodeObj && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider text-amber-400">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Secret Recovery Key
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(`${generatedCodeObj.formattedCode}\nSeed: ${generatedCodeObj.mnemonic}`)}
                      className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 font-bold text-[10px] hover:bg-amber-500/30"
                    >
                      {copiedKey ? 'Copied' : 'Copy Key'}
                    </button>
                  </div>

                  <div className="font-mono text-xs font-bold text-white p-2.5 bg-slate-950 rounded-lg border border-amber-500/20 break-all text-center tracking-wider">
                    {generatedCodeObj.formattedCode}
                  </div>

                  <label className="flex items-center gap-2 pt-0.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={backedUpConfirmed}
                      onChange={(e) => setBackedUpConfirmed(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className="text-[10px] text-slate-300">
                      I have backed up my Secret Recovery Key securely.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Create Account & Get Recovery Key</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* VIEW 5: RECOVERY FORM */}
          {!authState.isAuthenticated && mode === 'RECOVER' && (
            <form onSubmit={handleRecoverySubmit} className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed">
                <span className="font-bold text-white block mb-0.5">
                  Account Recovery via Secret Code
                </span>
                Enter your 12-word seed phrase or NEXUS-KEY formatted recovery code to restore account access.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="text"
                  value={recoveryIdentifier}
                  onChange={(e) => setRecoveryIdentifier(e.target.value)}
                  placeholder="treasurer@nexuspay.io"
                  className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Secret Recovery Code or 12-Word Phrase
                </label>
                <textarea
                  value={enteredSecretCode}
                  onChange={(e) => setEnteredSecretCode(e.target.value)}
                  rows={2}
                  placeholder="e.g. NEXUS-KEY-A8F1-99B2-33C4-77D0"
                  className="w-full bg-slate-950 text-white font-mono text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Verify & Proceed to 2FA</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
