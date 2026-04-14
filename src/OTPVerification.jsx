import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBackNavigation } from './hooks';
import { verifyOTP } from './services/authService';
import { fetchDirectoryData } from './services/directoryService';
import { fetchDefaultTrust, fetchTrustByName } from './services/trustService';
import { getMemberTrustLinks } from './services/api';
import logo from '../new_logo.png';

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  useBackNavigation(() => navigate('/login'));
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [trustInfo, setTrustInfo] = useState(null);

  const user = location.state?.user || null;
  const phoneNumber = location.state?.phoneNumber || '';

  useEffect(() => {
    let isActive = true;
    const loadTrust = async () => {
      try {
        const namedTrust = await fetchTrustByName('Mahila Mandal');
        if (namedTrust) {
          setTrustInfo(namedTrust);
          if (namedTrust.id) localStorage.setItem('selected_trust_id', namedTrust.id);
          if (namedTrust.name) localStorage.setItem('selected_trust_name', namedTrust.name);
          return;
        }
        const preferredTrustId = localStorage.getItem('selected_trust_id');
        const trust = await fetchDefaultTrust(preferredTrustId);
        if (isActive) setTrustInfo(trust);
        if (trust?.name) localStorage.setItem('selected_trust_name', trust.name);
      } catch (err) {
        console.warn('Failed to load trust info for OTP:', err);
      }
    };
    loadTrust();
    return () => { isActive = false; };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await verifyOTP(phoneNumber, otp);
      if (!result.success) {
        setError(result.message || 'Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        const selectedTrustId = user?.primary_trust?.id || localStorage.getItem('selected_trust_id');
        const selectedTrustName = user?.primary_trust?.name || localStorage.getItem('selected_trust_name');
        fetchDirectoryData(selectedTrustId || null, selectedTrustName || null).catch(err =>
          console.warn('Failed to pre-load directory data:', err)
        );
        // Pre-fetch and cache member trust links for sidebar
        const membersId = user?.members_id || user?.id;
        if (membersId) {
          getMemberTrustLinks(membersId).then((res) => {
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
              localStorage.setItem(`memberTrustLinks_${membersId}`, JSON.stringify(res.data));
              console.log(`✅ Pre-cached ${res.data.length} trust link(s) for member ${membersId}`);
            }
          }).catch((err) => console.warn('Failed to pre-load trust links:', err));
        }
        try { sessionStorage.removeItem('trust_selected_in_session'); } catch { /* ignore */ }
        navigate('/', { replace: true });
      } else {
        setError('User data not found. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/login');

  return (
    <div className="brand-page min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(192,36,26,0.15) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(43,47,126,0.12) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md" style={{ animation: 'fadeUp 0.5s ease-out both' }}>
        <div className="brand-card overflow-hidden">
          {/* Top accent bar */}
          <div className="brand-accent-bar" />

          {/* Logo */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center p-1"
              style={{ boxShadow: '0 0 0 4px #FDECEA, 0 6px 20px rgba(192,36,26,0.18)', background: '#fff' }}>
              <img
                src={trustInfo?.icon_url || logo}
                alt={trustInfo?.name || 'Hospital Logo'}
                className="w-full h-full object-contain rounded-full"
                loading="eager"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center px-6 mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: '#2B2F7E' }}>
              Verify OTP
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2 mb-3">
              <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #C0241A)' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C0241A' }} />
              <span className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #C0241A)' }} />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Enter the 6-digit OTP sent to
            </p>
            {phoneNumber && (
              <p className="font-bold text-base mt-1" style={{ color: '#2B2F7E' }}>
                +91 {phoneNumber}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: '#2B2F7E' }}>
                OTP Code
              </label>
              <input
                type="text"
                placeholder="— — — — — —"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full px-5 py-4 text-2xl text-center tracking-[0.5em] font-bold rounded-2xl outline-none transition-all"
                style={{
                  border: focused ? '2px solid #C0241A' : '2px solid #e2e8f0',
                  background: focused ? '#fff8f8' : '#f8fafc',
                  color: '#1e293b',
                  boxShadow: focused ? '0 0 0 4px rgba(192,36,26,0.10)' : 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            {error && (
              <div className="rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                style={{ background: '#FDECEA', border: '1.5px solid rgba(192,36,26,0.25)', color: '#9B1A13' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98]"
                style={{ background: '#EAEBF8', color: '#2B2F7E' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-[2] py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98] btn-brand"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: 'spin 0.75s linear infinite' }} />
                    Verifying...
                  </span>
                ) : 'Verify OTP ✓'}
              </button>
            </div>
          </form>

          {/* Resend */}
          <div className="border-t pb-5 pt-4 text-center" style={{ borderColor: '#f1f5f9' }}>
            <p className="text-sm text-gray-500">
              Didn't receive the OTP?{' '}
              <button
                onClick={handleBack}
                className="font-bold transition-colors"
                style={{ color: '#C0241A' }}
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default OTPVerification;
