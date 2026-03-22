import apiClient from '@/admin/services/apiClient'

export type ProfileSettings = {
  name: string
  email: string
  bio: string
  avatarUrl?: string
}

export type NotificationSettings = {
  emailNotifications: boolean
  courseUpdates: boolean
  studentMessages: boolean
}

export type PreferenceSettings = {
  language: string
  timezone: string
  defaultView: 'grid' | 'list'
}

export type InstructorSettings = {
  profile: ProfileSettings
  notifications: NotificationSettings
  preferences: PreferenceSettings
}

export type UpdateResult<T> = {
  data: T
  synced: boolean
}

type UserSeed = {
  id?: string
  name?: string
  email?: string
  avatar?: string
}

const STORAGE_PREFIX = 'vault-instructor-settings:'

const defaultSettings = (user?: UserSeed): InstructorSettings => ({
  profile: {
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: '',
    avatarUrl: user?.avatar ?? ''
  },
  notifications: {
    emailNotifications: true,
    courseUpdates: true,
    studentMessages: true
  },
  preferences: {
    language: 'English',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    defaultView: 'grid'
  }
})

const storageKey = (userId?: string) => `${STORAGE_PREFIX}${userId ?? 'local'}`

const mergeSettings = (base: InstructorSettings, patch?: Partial<InstructorSettings>): InstructorSettings => ({
  profile: { ...base.profile, ...(patch?.profile ?? {}) },
  notifications: { ...base.notifications, ...(patch?.notifications ?? {}) },
  preferences: { ...base.preferences, ...(patch?.preferences ?? {}) },
})

const readLocal = (key: string, fallback: InstructorSettings): InstructorSettings => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<InstructorSettings>
    return mergeSettings(fallback, parsed)
  } catch {
    return fallback
  }
}

const writeLocal = (key: string, patch: Partial<InstructorSettings>, fallback: InstructorSettings): InstructorSettings => {
  const next = mergeSettings(fallback, patch)
  localStorage.setItem(key, JSON.stringify(next))
  return next
}

const tryApi = async <T>(fn: () => Promise<T>): Promise<{ ok: boolean; data?: T }> => {
  try {
    const data = await fn()
    return { ok: true, data }
  } catch {
    return { ok: false }
  }
}

export const instructorSettingsService = {
  async get(user?: UserSeed): Promise<InstructorSettings> {
    const base = defaultSettings(user)
    const key = storageKey(user?.id)
    const api = await tryApi(() => apiClient.get('/instructor/settings').then(res => res.data))
    if (api.ok && api.data) {
      const merged = mergeSettings(base, api.data as Partial<InstructorSettings>)
      localStorage.setItem(key, JSON.stringify(merged))
      return merged
    }
    return readLocal(key, base)
  },

  async updateProfile(
    userId: string | undefined,
    profile: Partial<ProfileSettings>,
    current: InstructorSettings
  ): Promise<UpdateResult<InstructorSettings>> {
    const key = storageKey(userId)
    const api = await tryApi(() => apiClient.patch('/instructor/profile', profile).then(res => res.data))
    const next = writeLocal(key, { profile }, current)
    return { data: next, synced: api.ok }
  },

  async updateNotifications(
    userId: string | undefined,
    notifications: NotificationSettings,
    current: InstructorSettings
  ): Promise<UpdateResult<InstructorSettings>> {
    const key = storageKey(userId)
    const api = await tryApi(() => apiClient.patch('/instructor/notifications', notifications).then(res => res.data))
    const next = writeLocal(key, { notifications }, current)
    return { data: next, synced: api.ok }
  },

  async updatePreferences(
    userId: string | undefined,
    preferences: PreferenceSettings,
    current: InstructorSettings
  ): Promise<UpdateResult<InstructorSettings>> {
    const key = storageKey(userId)
    const api = await tryApi(() => apiClient.patch('/instructor/preferences', preferences).then(res => res.data))
    const next = writeLocal(key, { preferences }, current)
    return { data: next, synced: api.ok }
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<UpdateResult<null>> {
    const api = await tryApi(() => apiClient.post('/instructor/change-password', payload).then(res => res.data))
    return { data: null, synced: api.ok }
  },

  async deleteAccount(userId?: string): Promise<UpdateResult<null>> {
    const api = await tryApi(() => apiClient.delete('/instructor/account').then(res => res.data))
    if (userId) localStorage.removeItem(storageKey(userId))
    return { data: null, synced: api.ok }
  }
}

