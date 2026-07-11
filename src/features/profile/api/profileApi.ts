import { supabase } from '@/shared/lib/supabase'

// DB row shape
interface ProfileRow {
  id: string
  display_name: string
  created_at: string
  updated_at: string
}

// Frontend domain model
export interface Profile {
  id: string
  displayName: string
  createdAt: string
  updatedAt: string
}

export interface CreateProfileInput {
  userId: string
  displayName: string
}

export interface UpdateProfileInput {
  userId: string
  displayName: string
}

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function createProfileApiError(action: string, errorMessage?: string): Error {
  const msg = errorMessage ? `${action} ${errorMessage}` : action
  return new Error(msg)
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createProfileApiError('Failed to load profile.', error?.message)
  }

  if (!data) return null

  return mapProfileRow(data as ProfileRow)
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const trimmed = input.displayName.trim()

  if (trimmed.length === 0) {
    throw new Error('Display name is required.')
  }
  if (trimmed.length < 2) {
    throw new Error('Display name must be at least 2 characters.')
  }
  if (trimmed.length > 40) {
    throw new Error('Display name must be at most 40 characters.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: input.userId, display_name: trimmed })
    .select('id, display_name, created_at, updated_at')
    .single()

  if (error) {
    throw createProfileApiError('Failed to create profile.', error?.message)
  }

  if (!data) {
    throw createProfileApiError('Failed to create profile. Empty response from database.')
  }

  return mapProfileRow(data as ProfileRow)
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const trimmed = input.displayName.trim()

  if (trimmed.length === 0) {
    throw new Error('Display name is required.')
  }
  if (trimmed.length < 2) {
    throw new Error('Display name must be at least 2 characters.')
  }
  if (trimmed.length > 40) {
    throw new Error('Display name must be at most 40 characters.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed })
    .eq('id', input.userId)
    .select('id, display_name, created_at, updated_at')
    .single()

  if (error) {
    throw createProfileApiError('Failed to update profile.', error?.message)
  }

  if (!data) {
    throw createProfileApiError('Failed to update profile. Empty response from database.')
  }

  return mapProfileRow(data as ProfileRow)
}
