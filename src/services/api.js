import axios from 'axios';
import { getCurrentNotificationContext } from './notificationAudience';

const buildNotificationContentKey = (notification) => {
  const title = String(notification?.title || '').trim().toLowerCase();
  const message = String(notification?.message || notification?.body || '').trim().toLowerCase();
  const type = String(notification?.type || '').trim().toLowerCase();
  const createdAt = String(notification?.created_at || '').trim();
  const createdAtSecond = createdAt ? createdAt.slice(0, 19) : '';
  return `${type}|${title}|${message}|${createdAtSecond}`;
};


// Use /api prefix in both environments (backend routes are mounted under /api/*)
// In emulator/device testing, localhost points to the device itself.
// So in dev we derive backend host from current page host unless explicitly overridden.
const resolveDevApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5002/api';

  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname || 'localhost';
  return `${protocol}//${hostname}:5002/api`;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? resolveDevApiBaseUrl()
    : 'https://mah.contractmitra.in/api');


// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Get all members
export const getAllMembers = async (trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);
    const response = await api.get(`/members${params.toString() ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all members:', error);
    throw error;
  }
};

// Get members by page
export const getMembersPage = async (page = 1, limit = 100, trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);
    const response = await api.get(`/members?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching members page:', error);
    throw error;
  }
};

// Get doctors
export const getDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

// Get members by type
export const getMembersByType = async (type, trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);
    const response = await api.get(`/members/type/${type}${params.toString() ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching members of type ${type}:`, error);
    throw error;
  }
};

// Search members
export const searchMembers = async (query, type = null, trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (type) params.append('type', type);
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);

    const response = await api.get(`/members/search?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error searching members:', error);
    throw error;
  }
};

// Get member types
export const getMemberTypes = async (trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);
    const response = await api.get(`/members/types${params.toString() ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching member types:', error);
    throw error;
  }
};

// Get all doctors
export const getAllDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

// Get all committee members
export const getAllCommitteeMembers = async (trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);
    const response = await api.get(`/committee${params.toString() ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching committee members:', error);
    throw error;
  }
};

// Get all hospitals
export const getAllHospitals = async (trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);
    const response = await api.get(`/hospitals${params.toString() ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw error;
  }
};

// Get all elected members
export const getAllElectedMembers = async (trustId = null, trustName = null) => {
  try {
    const params = new URLSearchParams();
    if (trustId) params.append('trust_id', trustId);
    if (trustName) params.append('trust_name', trustName);
    const response = await api.get(`/elected-members${params.toString() ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching elected members:', error);
    throw error;
  }
};

// Referral API functions
export const createReferral = async (referralData) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.post('/referrals', referralData, {
      headers: {
        'user-id': userId,
        'user': user
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
};

export const getUserReferrals = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.get('/referrals/my-referrals', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching referrals:', error);
    throw error;
  }
};

export const getReferralCounts = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.get('/referrals/counts', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching referral counts:', error);
    throw error;
  }
};

export const updateReferral = async (referralId, referralData) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.patch(`/referrals/${referralId}`, referralData, {
      headers: {
        'user-id': userId,
        'user': user
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating referral:', error);
    throw error;
  }
};

export const deleteReferral = async (referralId) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.delete(`/referrals/${referralId}`, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting referral:', error);
    throw error;
  }
};

// Preload commonly used data
// Get user profile
export const getProfile = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    const response = await api.get('/profile', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Save user profile
export const saveProfile = async (profileData, profilePhotoFile) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('profileData', JSON.stringify(profileData));
    if (profilePhotoFile) {
      formData.append('profilePhoto', profilePhotoFile);
    }

    const response = await api.post('/profile/save', formData, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// Get marquee updates — direct Supabase (no backend needed)
export const getMarqueeUpdates = async (trustId = null, trustName = null) => {
  try {
    const { supabase } = await import('./supabaseClient.js');

    // Resolve trustId from trustName if needed
    let resolvedTrustId = trustId || null;
    if (!resolvedTrustId && trustName) {
      const { data: trustData } = await supabase
        .from('Trust')
        .select('id')
        .ilike('name', String(trustName).trim())
        .limit(1);
      if (trustData?.[0]?.id) resolvedTrustId = trustData[0].id;
    }

    let query = supabase
      .from('marquee_updates')
      .select('id, trust_id, message, is_active, priority')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (resolvedTrustId) {
      query = query.eq('trust_id', resolvedTrustId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      success: true,
      data: (data || []).map(item => ({ message: item.message, ...item })),
    };
  } catch (error) {
    console.error('Error fetching marquee updates:', error);
    return { success: false, data: [] };
  }
};

// Get sponsor information
export const getSponsors = async (trustId = null, trustName = null) => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const getTodayLocal = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const getUserMobileDigits = () => {
      if (typeof window === 'undefined') return '';
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return '';
        const user = JSON.parse(userStr);
        const rawMobile = user?.Mobile || user?.mobile || user?.phone || '';
        return String(rawMobile).replace(/\D/g, '');
      } catch {
        return '';
      }
    };
    const isRefMatch = (refNo, userDigits) => {
      if (!refNo || !userDigits) return false;
      const refDigits = String(refNo).replace(/\D/g, '');
      if (!refDigits) return false;
      return refDigits === userDigits || refDigits.slice(-10) === userDigits.slice(-10);
    };

    let resolvedTrustId = trustId || null;
    if (!resolvedTrustId && trustName) {
      const { data: trustData, error: trustError } = await supabase
        .from('Trust')
        .select('id')
        .eq('name', trustName)
        .limit(1);
      if (!trustError && Array.isArray(trustData) && trustData[0]?.id) {
        resolvedTrustId = trustData[0].id;
      }
    }

    if (!resolvedTrustId) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('sponsor_flash')
      .select(`
        id,
        trust_id,
        start_date,
        end_date,
        duration_seconds,
        priority,
        sponsors (
          id,
          name,
          position,
          about,
          photo_url,
          company_name,
          ref_no,
          created_at,
          updated_at,
          phone,
          badge_label,
          email_id,
          address,
          city,
          state,
          whatsapp_number,
          website_url,
          catalog_url
        )
      `)
      .eq('trust_id', resolvedTrustId);

    if (error) throw error;

    const today = getTodayLocal();
    const userMobileDigits = getUserMobileDigits();
    const mapped = (data || [])
      .filter((row) => {
        const sponsor = row?.sponsors || null;
        if (!sponsor) return false;
        if (row.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.start_date)) return false;
        if (row.end_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.end_date)) return false;
        const startOk = !row.start_date || row.start_date <= today;
        const endOk = row.end_date && row.end_date >= today;
        return startOk && endOk;
      })
      .map((row) => ({
        id: row.sponsors.id,
        name: row.sponsors.name,
        position: row.sponsors.position,
        about: row.sponsors.about,
        photo_url: row.sponsors.photo_url,
        company_name: row.sponsors.company_name,
        ref_no: row.sponsors.ref_no,
        created_at: row.sponsors.created_at,
        updated_at: row.sponsors.updated_at,
        phone: row.sponsors.phone,
        badge_label: row.sponsors.badge_label,
        email_id: row.sponsors.email_id,
        address: row.sponsors.address,
        city: row.sponsors.city,
        state: row.sponsors.state,
        whatsapp_number: row.sponsors.whatsapp_number,
        website_url: row.sponsors.website_url,
        catalog_url: row.sponsors.catalog_url,
        is_user_match: isRefMatch(row.sponsors.ref_no, userMobileDigits),
        flash_id: row.id,
        trust_id: row.trust_id,
        start_date: row.start_date,
        end_date: row.end_date,
        duration_seconds: row.duration_seconds,
        flash_priority: row.priority
      }))
      .sort((a, b) => {
        const priorityDiff = (b.flash_priority || 0) - (a.flash_priority || 0);
        if (priorityDiff !== 0) return priorityDiff;
        if (a.is_user_match !== b.is_user_match) return a.is_user_match ? -1 : 1;
        const refDiff = (b.ref_no || 0) - (a.ref_no || 0);
        if (refDiff !== 0) return refDiff;
        return String(a.company_name || '').localeCompare(String(b.company_name || ''));
      });

    return { success: true, data: mapped };
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    throw error;
  }
};

// Get specific sponsor by ID
export const getSponsorById = async (id) => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { data, error } = await supabase
      .from('sponsors')
      .select(`
        id,
        name,
        position,
        about,
        photo_url,
        company_name,
        ref_no,
        created_at,
        updated_at,
        phone,
        badge_label,
        email_id,
        address,
        city,
        state,
        whatsapp_number,
        website_url,
        catalog_url
      `)
      .eq('id', id)
      .limit(1);
    if (error) throw error;
    const sponsor = Array.isArray(data) ? data[0] : data;
    return { success: true, data: sponsor ? [sponsor] : [] };
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    throw error;
  }
};

// Get user reports
export const getUserReports = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    const response = await api.get('/reports', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get user notifications — directly from Supabase
export const getUserNotifications = async () => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { userId, userIdVariants, audienceVariants } = getCurrentNotificationContext();

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    // Fallback mapping:
    // Notifications can be stored with user_id = patient_phone, patient_name, membership_number, or user_id.
    // We query appointments by patient_phone variants to find all possible user_ids used in notifications.
    const { data: linkedAppointments } = await supabase
      .from('appointments')
      .select('patient_name, membership_number, user_id, patient_phone')
      .in('patient_phone', userIdVariants)
      .limit(500);

    const fallbackUserIds = new Set();
    (linkedAppointments || []).forEach((row) => {
      const patientName = String(row?.patient_name || '').trim();
      const membershipNumber = String(row?.membership_number || '').trim();
      const appointmentUserId = String(row?.user_id || '').trim();
      // ✅ patient_phone explicitly — this is what the Supabase trigger stores as user_id
      const patientPhone = String(row?.patient_phone || '').trim();

      if (patientName) fallbackUserIds.add(patientName);
      if (membershipNumber) fallbackUserIds.add(membershipNumber);
      if (appointmentUserId) fallbackUserIds.add(appointmentUserId);

      // Add patient_phone and its variants (e.g. 9911334455, 919911334455, +919911334455)
      if (patientPhone) {
        fallbackUserIds.add(patientPhone);
        const digitsOnly = patientPhone.replace(/\D/g, '');
        if (digitsOnly) {
          fallbackUserIds.add(digitsOnly);
          if (digitsOnly.length >= 10) fallbackUserIds.add(digitsOnly.slice(-10));
          if (!digitsOnly.startsWith('91') && digitsOnly.length === 10) {
            fallbackUserIds.add(`91${digitsOnly}`);
          }
          if (digitsOnly.length === 10) fallbackUserIds.add(`+91${digitsOnly}`);
          fallbackUserIds.add(`+${digitsOnly}`);
        }
      }
    });

    const notificationUserIds = [...new Set([...userIdVariants, ...fallbackUserIds])];

    const { data: userNotifications, error: userNotifError } = await supabase
      .from('notifications')
      .select('*')
      .in('user_id', notificationUserIds)
      .order('created_at', { ascending: false });

    if (userNotifError) throw userNotifError;

    const { data: audienceNotifications, error: audienceError } = await supabase
      .from('notifications')
      .select('*')
      .in('target_audience', audienceVariants)
      .order('created_at', { ascending: false });

    if (audienceError) throw audienceError;

    const merged = [...(userNotifications || []), ...(audienceNotifications || [])];
    const uniqueById = [...new Map(merged.map((item) => [item.id, item])).values()];
    uniqueById.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const seenContent = new Set();
    const deduped = [];
    for (const notification of uniqueById) {
      const key = buildNotificationContentKey(notification);
      if (seenContent.has(key)) continue;
      seenContent.add(key);
      deduped.push(notification);
    }

    return { success: true, data: deduped };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// Mark notification as read — directly via Supabase
export const markNotificationAsRead = async (id) => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read — directly via Supabase
export const markAllNotificationsAsRead = async () => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { userId, userIdVariants, audienceVariants } = getCurrentNotificationContext();

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    const { data: linkedAppointments } = await supabase
      .from('appointments')
      .select('patient_name, membership_number, user_id, patient_phone')
      .in('patient_phone', userIdVariants)
      .limit(500);

    const fallbackUserIds = new Set();
    (linkedAppointments || []).forEach((row) => {
      const patientName = String(row?.patient_name || '').trim();
      const membershipNumber = String(row?.membership_number || '').trim();
      const appointmentUserId = String(row?.user_id || '').trim();
      const patientPhone = String(row?.patient_phone || '').trim();

      if (patientName) fallbackUserIds.add(patientName);
      if (membershipNumber) fallbackUserIds.add(membershipNumber);
      if (appointmentUserId) fallbackUserIds.add(appointmentUserId);

      // ✅ patient_phone variants — matches notifications stored by trigger using patient_phone
      if (patientPhone) {
        fallbackUserIds.add(patientPhone);
        const digitsOnly = patientPhone.replace(/\D/g, '');
        if (digitsOnly) {
          fallbackUserIds.add(digitsOnly);
          if (digitsOnly.length >= 10) fallbackUserIds.add(digitsOnly.slice(-10));
          if (!digitsOnly.startsWith('91') && digitsOnly.length === 10) {
            fallbackUserIds.add(`91${digitsOnly}`);
          }
          if (digitsOnly.length === 10) fallbackUserIds.add(`+91${digitsOnly}`);
          fallbackUserIds.add(`+${digitsOnly}`);
        }
      }
    });

    const notificationUserIds = [...new Set([...userIdVariants, ...fallbackUserIds])];

    const { error: userError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .in('user_id', notificationUserIds);

    if (userError) throw userError;

    const { error: audienceError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .in('target_audience', audienceVariants);

    if (audienceError) throw audienceError;
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get member trust links — direct Supabase query (no backend needed)
export const getMemberTrustLinks = async (memberId) => {
  try {
    if (!memberId) {
      throw new Error('memberId is required');
    }
    const { supabase } = await import('./supabaseClient.js');
    const { data: links, error } = await supabase
      .from('member_trust_links')
      .select(`
        id,
        member_id,
        trust_id,
        membership_no,
        location,
        remark1,
        remark2,
        is_active,
        created_at,
        Trust:trust_id (
          id,
          name,
          icon_url
        )
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching member trust links from Supabase:', error);
      throw error;
    }

    return { success: true, data: links || [], count: (links || []).length };
  } catch (error) {
    console.error(`Error fetching trust links for member ${memberId}:`, error);
    return { success: false, data: [], message: error.message };
  }
};

// Delete/dismiss a specific notification — uses Supabase directly (no backend needed)
export const deleteNotification = async (id) => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Upload user report
export const uploadUserReport = async (reportData, reportFile) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('reportName', reportData.reportName);
    formData.append('reportType', reportData.reportType);
    formData.append('testDate', reportData.testDate);
    if (reportFile) {
      formData.append('reportFile', reportFile);
    }

    const response = await api.post('/reports/upload', formData, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading report:', error);
    throw error;
  }
};


// Get profile photos for multiple members
export const getProfilePhotos = async (memberIds) => {
  try {
    const response = await api.post('/profile/photos', { memberIds });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile photos:', error);
    throw error;
  }
};

export const preloadCommonData = async () => {
  try {
    const trustId = localStorage.getItem('selected_trust_id') || null;
    const trustName = localStorage.getItem('selected_trust_name') || null;
    // Load small amounts of data in parallel for quick initial load
    const [membersPreview, memberTypes, hospitals] = await Promise.allSettled([
      getMembersPage(1, 50, trustId, trustName),  // Get a small preview
      getMemberTypes(trustId, trustName),
      getAllHospitals(trustId, trustName)       // Hospitals are typically small dataset
    ]);

    const result = {
      membersPreview: membersPreview.status === 'fulfilled' ? membersPreview.value : null,
      memberTypes: memberTypes.status === 'fulfilled' ? memberTypes.value : null,
      hospitals: hospitals.status === 'fulfilled' ? hospitals.value : null
    };

    console.log('✅ Preloaded common data for faster directory loading');
    return result;
  } catch (error) {
    console.error('Error preloading common data:', error);
    return {};
  }
};
