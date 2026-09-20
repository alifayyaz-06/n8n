import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  UtensilsCrossed,
  Lock,
  Phone,
  Store,
  KeyRound,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  LogIn,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Mode tab: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Login form state (Phone + Password)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Register form state & wizard step: 1 = Phone Check, 2 = Master Key, 3 = Password Creation (NO EMAIL)
  const [step, setStep] = useState(1);
  const [regPhone, setRegPhone] = useState('');
  const [regName, setRegName] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);

  // Already Registered Popup Modal State
  const [showAlreadyExistsModal, setShowAlreadyExistsModal] = useState(false);
  const [existingPhoneMsg, setExistingPhoneMsg] = useState('');

  // 1. Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      await login(loginPhone, loginPassword);
      navigate('/', { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoPhone) => {
    setLoginPhone(demoPhone);
    setLoginPassword('Password123!');
    setLoginError(null);
    setLoading(true);

    try {
      await login(demoPhone, 'Password123!');
      navigate('/', { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Registration Step 1: Verify Phone Number
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (!regPhone.trim() || !regName.trim()) return;

    setRegError(null);

    // Pakistani Phone Validation (11 digits starting with 03 or 12 digits starting with 923)
    const cleanDigits = regPhone.trim().replace(/\D/g, '');
    const isValidPakistani =
      (cleanDigits.length === 11 && cleanDigits.startsWith('03')) ||
      (cleanDigits.length === 12 && cleanDigits.startsWith('923'));

    if (!isValidPakistani) {
      setRegError('Invalid Pakistani phone number. Must be 11 digits starting with 03 (e.g., 03001234567 or 03219876543).');
      return;
    }

    setRegLoading(true);

    try {
      const res = await authService.checkPhone(regPhone.trim());
      if (res.exists) {
        setExistingPhoneMsg(
          `Phone number '${regPhone}' is already registered for restaurant '${res.restaurantName || 'Account'}'. You cannot register again with this number.`
        );
        setShowAlreadyExistsModal(true);
      } else {
        setStep(2);
      }
    } catch (err) {
      setRegError(err.message || 'Failed to verify phone number.');
    } finally {
      setRegLoading(false);
    }
  };

  // 3. Registration Step 2: Validate Master Key
  const handleValidateMasterKey = async (e) => {
    e.preventDefault();
    if (!masterKey.trim()) return;

    setRegError(null);
    setRegLoading(true);

    try {
      const res = await authService.validateMasterKey(masterKey.trim());
      if (res.valid) {
        setStep(3);
      } else {
        setRegError('Invalid Master Key. Access denied.');
      }
    } catch (err) {
      setRegError(err.message || 'Invalid Master Key. Access denied.');
    } finally {
      setRegLoading(false);
    }
  };

  // 4. Registration Step 3: Complete Account Setup with Password ONLY (NO EMAIL)
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setRegError(null);
    setRegLoading(true);

    try {
      await register({
        restaurantName: regName.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        masterKey: masterKey.trim(),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setRegError(err.message || 'Failed to complete registration.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/15">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Restaurant SaaS Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Multi-Tenant Secure Order & Kitchen Management
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setMode('register');
              setRegError(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Restaurant Sign Up</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {mode === 'login' ? (
            /* ================= SIGN IN VIEW ================= */
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900">Sign in to your restaurant</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your registered phone number and password to access your dashboard.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="03001234567"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Account Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Demo Restaurant Accounts</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('03001234567')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        <Store className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          Gourmet Bistro (Tenant A)
                        </h4>
                        <p className="text-[11px] text-slate-500">Phone: 03001234567</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Login &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('03219876543')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        <Store className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          Lahore Grill (Tenant B)
                        </h4>
                        <p className="text-[11px] text-slate-500">Phone: 03219876543</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Login &rarr;
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= MULTI-STEP REGISTER WIZARD (NO EMAIL REQUIRED) ================= */
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Register New Restaurant</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {step === 1 && 'Step 1 of 3: Phone & Restaurant Check'}
                    {step === 2 && 'Step 2 of 3: Master Key Authorization'}
                    {step === 3 && 'Step 3 of 3: Create Account Password'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-600">
                  <span>Step {step}/3</span>
                </div>
              </div>

              {regError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                  {regError}
                </div>
              )}

              {/* STEP 1: Phone Check */}
              {step === 1 && (
                <form onSubmit={handleVerifyPhone} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Restaurant Name *
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Karakoram Grill"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 03001234567"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    {regLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verify Phone & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Master Key Authorization */}
              {step === 2 && (
                <form onSubmit={handleValidateMasterKey} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                    Phone number verified! Before creating your password, enter the system <strong>Master Key</strong> authorized by administration.
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Master Key Passkey *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="e.g. MASTER-KEY-2026"
                        value={masterKey}
                        onChange={(e) => setMasterKey(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 pt-0.5">
                      Default Master Key for demo setup: <code className="font-mono text-emerald-700 font-bold">MASTER-KEY-2026</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Validate Master Key</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Password Creation ONLY (NO EMAIL FIELD REQUIRED!) */}
              {step === 3 && (
                <form onSubmit={handleCompleteRegistration} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Master Key validated! Set a password for phone <strong>{regPhone}</strong>.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Create Account & Open Dashboard</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL ALERT: Phone Number Already Registered */}
      {showAlreadyExistsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Account Already Exists!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{existingPhoneMsg}</p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAlreadyExistsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAlreadyExistsModal(false);
                  setMode('login');
                  setLoginPhone(regPhone);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Sign In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
