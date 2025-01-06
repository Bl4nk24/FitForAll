// src/composables/useAuth.js
import { ref } from 'vue'
import { supabase } from '@/supabase' // oder '../supabase'

const user = ref(null)
const session = ref(null)

// Beim Laden der App aktuelle Session laden
async function loadUser() {
  const { data: { user: currentUser }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Fehler beim Laden des Nutzers:', error)
    return
  }
  user.value = currentUser
}

// Email + Passwort Login
async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    user.value = data.user
    session.value = data.session
    return { user: user.value, session: session.value }
  } catch (err) {
    console.error('Login fehlgeschlagen:', err)
    return null
  }
}

// Email + Passwort Registrierung
async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    // Direkt einloggen oder E-Mail-Verifizierung abwarten
    user.value = data.user
    session.value = data.session
    return { user: user.value, session: session.value }
  } catch (err) {
    console.error('Registrierung fehlgeschlagen:', err)
    return null
  }
}

// Abmelden
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    session.value = null
  } catch (err) {
    console.error('Abmeldung fehlgeschlagen:', err)
  }
}

// Observer (optional): Lauscht auf Session-Änderungen
supabase.auth.onAuthStateChange((event, sessionData) => {
  session.value = sessionData
  user.value = sessionData?.user || null
})

export function useAuth() {
  return {
    user,
    session,
    loadUser,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
