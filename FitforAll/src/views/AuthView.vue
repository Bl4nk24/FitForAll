<template>
    <div class="container py-5 h-100" aria-label="Anmeldung und Registrierung">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card shadow-lg" style="border-radius: 1rem;">
            <div class="card-body p-4">
              <!-- Navigation: Tabs für Login und Registrierung -->
              <ul class="nav nav-tabs" id="authTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link active"
                    id="login-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#login"
                    type="button"
                    role="tab"
                    aria-controls="login"
                    aria-selected="true"
                  >
                    Login
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    id="register-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#register"
                    type="button"
                    role="tab"
                    aria-controls="register"
                    aria-selected="false"
                  >
                    Registrieren
                  </button>
                </li>
              </ul>
  
              <!-- Inhalt: Login / Registrierung per Tabs -->
              <div class="tab-content" id="authTabsContent">
                <!-- Login-Tab -->
                <div
                  class="tab-pane fade show active"
                  id="login"
                  role="tabpanel"
                  aria-labelledby="login-tab"
                >
                  <div class="mt-4">
                    <h3 class="text-center mb-3">Login</h3>
                    <form @submit.prevent="handleLogin">
                      <div class="mb-3">
                        <label for="emailLogin" class="form-label">E-Mail</label>
                        <input
                          type="email"
                          class="form-control"
                          id="emailLogin"
                          v-model="loginEmail"
                          required
                          aria-required="true"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="passwordLogin" class="form-label">Passwort</label>
                        <input
                          type="password"
                          class="form-control"
                          id="passwordLogin"
                          v-model="loginPassword"
                          required
                          aria-required="true"
                        />
                      </div>
                      <button type="submit" class="btn btn-primary w-100">
                        Einloggen
                      </button>
                    </form>
  
                    <!-- Fehlerausgabe beim Login -->
                    <div class="mt-3" v-if="loginError">
                      <div class="alert alert-danger">
                        {{ loginError }}
                      </div>
                    </div>
                  </div>
                </div>
  
                <!-- Registrier-Tab -->
                <div
                  class="tab-pane fade"
                  id="register"
                  role="tabpanel"
                  aria-labelledby="register-tab"
                >
                  <div class="mt-4">
                    <h3 class="text-center mb-3">Registrieren</h3>
                    <form @submit.prevent="handleRegister">
                      <div class="mb-3">
                        <label for="emailRegister" class="form-label">E-Mail</label>
                        <input
                          type="email"
                          class="form-control"
                          id="emailRegister"
                          v-model="registerEmail"
                          required
                          aria-required="true"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="passwordRegister" class="form-label">Passwort</label>
                        <input
                          type="password"
                          class="form-control"
                          id="passwordRegister"
                          v-model="registerPassword"
                          required
                          aria-required="true"
                        />
                      </div>
                      <button type="submit" class="btn btn-success w-100">
                        Konto erstellen
                      </button>
                    </form>
  
                    <!-- Fehlerausgabe bei der Registrierung -->
                    <div class="mt-3" v-if="registerError">
                      <div class="alert alert-danger">
                        {{ registerError }}
                      </div>
                    </div>
                  </div>
                </div> <!-- Ende tab-pane -->
              </div> <!-- Ende tab-content -->
            </div> <!-- Ende card-body -->
          </div> <!-- Ende card -->
        </div> <!-- Ende col -->
      </div> <!-- Ende row -->
    </div> <!-- Ende container -->
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { supabase } from '../supabase'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  // --- Login ---
  const loginEmail = ref('')
  const loginPassword = ref('')
  const loginError = ref('')
  
  const handleLogin = async () => {
    loginError.value = ''
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value,
    })
    if (error) {
      loginError.value = error.message
    } else {
      // Bei Erfolg: Weiterleitung zur Hauptseite (bspw. "/")
      router.push('/')
    }
  }
  
  // --- Register ---
  const registerEmail = ref('')
  const registerPassword = ref('')
  const registerError = ref('')
  
  const handleRegister = async () => {
    registerError.value = ''
    // 1) Versuche, einen neuen User anzulegen
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: registerEmail.value,
      password: registerPassword.value,
    })
  
    if (signUpError) {
      // Fehler beim Registrieren
      registerError.value = signUpError.message
      return
    }
  
    // 2) Hat das geklappt und wir haben einen neuen User?
    if (signUpData?.user) {
      // 3) Erstelle einen Eintrag in user_settings (oder in profiles),
      //    damit jeder User dort einen Datensatz hat.
      const { id: newUserId } = signUpData.user
  
      // Beispiel: user_settings
      // Passe an deine Spalten an (z.B. has_finished_onboarding, color_contrast etc.).
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: newUserId,
          has_finished_onboarding: false,
          color_contrast: 'normal',
          font_size: 'normal',
          screenreader: false,
          // physical_limitations: '{}', // falls du das Feld hast (text[] oder ähnliches)
        })
  
      if (insertError) {
        // Falls das Anlegen fehlschlägt, kannst du eine Fehlermeldung ausgeben
        registerError.value = insertError.message
        return
      }
    }
  
    // 4) Weiterleitung nach erfolgreicher Registrierung
    router.push('/')
  }
  </script>
  
  <style scoped>
  /* Optionale Styles für mehr Abstand/Ästhetik */
  h3 {
    font-weight: 600;
  }
  
  .card {
    border: none;
    border-radius: 1rem;
  }
  
  .nav-tabs .nav-link.active {
    border: none;
    border-bottom: 2px solid #0d6efd; /* Farbe der aktiven Tab-Grenze */
  }
  </style>
  