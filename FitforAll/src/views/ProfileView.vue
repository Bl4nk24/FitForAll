<template>
    <div class="container mt-5" aria-label="Profil und Übersicht">
      <div class="row">
        <!-- Linke Spalte: Benutzerinformationen -->
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Profil</h4>
            </div>
            <div class="card-body">
              <div v-if="profile">
                <!-- Avatar / Bild -->
                <div class="text-center mb-4">
                  <img
                    :src="profile.avatar_url || defaultAvatar"
                    alt="Avatar"
                    class="rounded-circle img-thumbnail"
                    style="width: 120px; height: 120px; object-fit: cover;"
                  />
                </div>
                <!-- Benutzerdetails -->
                <h5 class="card-title text-center">
                  {{ profile.full_name || userEmail }}
                </h5>
                <p class="card-text text-center">
                  <strong>E-Mail:</strong> {{ userEmail }}
                </p>
                <!-- Zusätzliche Profilfelder -->
                <p v-if="profile.bio" class="text-muted text-center">
                  {{ profile.bio }}
                </p>
  
                <!-- Button zum Anzeigen des Bearbeitungsformulars -->
                <div class="d-grid mt-3">
                  <button class="btn btn-outline-primary" @click="editMode = true">
                    Profil bearbeiten
                  </button>
                </div>
              </div>
  
              <div v-else>
                <p>Lade Profilinformationen...</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Rechte Spalte: Dashboard -->
        <div class="col-md-8">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-success text-white">
              <h4 class="mb-0">Dein Fitness-Dashboard</h4>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <h5>Nächste Trainingssession</h5>
                <p class="text-muted">
                  {{ nextWorkout ? nextWorkout.name : 'Kein Workout geplant' }}
                </p>
                <!-- Beispiel für einen Fortschrittsbalken -->
                <div v-if="nextWorkout">
                  <div class="mb-2">
                    <small>Fortschritt: {{ nextWorkout.progress }}%</small>
                  </div>
                  <div class="progress">
                    <div
                      class="progress-bar progress-bar-striped progress-bar-animated bg-info"
                      role="progressbar"
                      :style="{ width: nextWorkout.progress + '%' }"
                      :aria-valuenow="nextWorkout.progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              </div>
  
              <hr />
  
              <div class="mb-3">
                <h5>Aktueller Monats-Fortschritt</h5>
                <div class="row">
                  <div class="col-6 text-center">
                    <h6>Trainings absolviert</h6>
                    <p class="display-6 text-primary fw-bold">
                      {{ monthlyStats.completedWorkouts }}
                    </p>
                  </div>
                  <div class="col-6 text-center">
                    <h6>Offene Workouts</h6>
                    <p class="display-6 text-danger fw-bold">
                      {{ monthlyStats.remainingWorkouts }}
                    </p>
                  </div>
                </div>
              </div>
  
              <hr />
  
              <div>
                <h5>Empfohlene Übungen</h5>
                <ul class="list-group list-group-flush" v-if="recommendedExercises.length > 0">
                  <li
                    v-for="exercise in recommendedExercises"
                    :key="exercise.id"
                    class="list-group-item"
                  >
                    <strong>{{ exercise.name }}</strong> –
                    {{ exercise.description }}
                  </li>
                </ul>
                <p v-else class="text-muted">
                  Keine Empfehlungen vorhanden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Bearbeitungsformular (im Modal oder inline) -->
      <div
        class="modal fade"
        tabindex="-1"
        role="dialog"
        :class="{ show: editMode }"
        style="display: block"
        v-if="editMode"
      >
        <div class="modal-dialog modal-md" role="document">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Profil bearbeiten</h5>
              <button type="button" class="btn-close" aria-label="Close" @click="cancelEdit"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveProfile">
                <!-- full_name -->
                <div class="mb-3">
                  <label for="fullName" class="form-label">Voller Name</label>
                  <input
                    id="fullName"
                    type="text"
                    class="form-control"
                    v-model="editProfileData.full_name"
                  />
                </div>
  
                <!-- bio -->
                <div class="mb-3">
                  <label for="bio" class="form-label">Bio</label>
                  <textarea
                    id="bio"
                    class="form-control"
                    rows="3"
                    v-model="editProfileData.bio"
                  ></textarea>
                </div>
  
                <!-- avatar_url -->
                <div class="mb-3">
                  <label for="avatarUrl" class="form-label">Avatar URL</label>
                  <input
                    id="avatarUrl"
                    type="url"
                    class="form-control"
                    v-model="editProfileData.avatar_url"
                  />
                  <small class="text-muted">Direkter Link zu einem Bild, z.B. https://...</small>
                </div>
  
                <!-- Beispiel: color_contrast -->
                <div class="mb-3">
                  <label for="colorContrast" class="form-label">Farbschema</label>
                  <select
                    id="colorContrast"
                    class="form-select"
                    v-model="editProfileData.color_contrast"
                  >
                    <option value="normal">Normal</option>
                    <option value="high-contrast">Hoher Kontrast</option>
                    <option value="dark">Dunkles Design</option>
                  </select>
                </div>
  
                <!-- Beispiel: font_size -->
                <div class="mb-3">
                  <label for="fontSize" class="form-label">Schriftgröße</label>
                  <select
                    id="fontSize"
                    class="form-select"
                    v-model="editProfileData.font_size"
                  >
                    <option value="normal">Normal</option>
                    <option value="large">Groß</option>
                    <option value="x-large">Extra Groß</option>
                  </select>
                </div>
  
                <!-- screenreader (boolean) -->
                <div class="mb-3 form-check">
                  <input
                    id="screenreader"
                    type="checkbox"
                    class="form-check-input"
                    v-model="editProfileData.screenreader"
                  />
                  <label for="screenreader" class="form-check-label">
                    Screenreader-Modus aktivieren
                  </label>
                </div>
  
                <!-- Abschicken -->
                <button type="submit" class="btn btn-success w-100">
                  Speichern
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Overlay-Hintergrund fürs Modal (nur wenn Modal offen) -->
      <div
        class="modal-backdrop fade"
        :class="{ show: editMode }"
        v-if="editMode"
        @click="cancelEdit"
      ></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../supabase'
  
  // Lokale Refs
  const userEmail = ref('')
  const profile = ref(null)
  const defaultAvatar = '/default-avatar.png' // z.B. im "public"-Ordner
  
  // Beispielhafter "Dashboard"-Content
  const nextWorkout = ref(null)
  const monthlyStats = ref({
    completedWorkouts: 0,
    remainingWorkouts: 0,
  })
  const recommendedExercises = ref([])
  
  const router = useRouter()
  
  // State fürs Bearbeiten
  const editMode = ref(false)
  const editProfileData = ref({
    full_name: '',
    bio: '',
    avatar_url: '',
    color_contrast: 'normal',
    font_size: 'normal',
    screenreader: false
  })
  
  onMounted(async () => {
    // 1) Sicherstellen, dass ein User eingeloggt ist
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      // Kein User => Weiterleitung zum Login
      return router.push('/auth')
    }
    userEmail.value = authData.user.email
  
    // 2) Profilinfos abrufen (Tabelle: "profiles")
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
  
      if (profileError) throw profileError
  
      profile.value = profileData
  
      // Falls du weitere Felder hast (z.B. color_contrast, font_size etc.),
      // einmal ins local state übernehmen:
      editProfileData.value.full_name = profileData.full_name || ''
      editProfileData.value.bio = profileData.bio || ''
      editProfileData.value.avatar_url = profileData.avatar_url || ''
      editProfileData.value.color_contrast = profileData.color_contrast || 'normal'
      editProfileData.value.font_size = profileData.font_size || 'normal'
      editProfileData.value.screenreader = profileData.screenreader || false
  
    } catch (err) {
      console.error('Fehler beim Laden des Profils:', err.message)
    }
  
    // 3) Beispielhafter "Dashboard" – wir simulieren hier einfach ein paar Daten
    await loadDashboardData(authData.user.id)
  })
  
  /**
   * Lädt verschiedene Infos für das Dashboard (Beispielhaft).
   */
  async function loadDashboardData(userId) {
    // Normalerweise würdest du hier ggf. mehrere Supabase-Abfragen machen.
    // Wir machen ein Beispiel und setzen Dummy-Daten.
    nextWorkout.value = {
      name: 'Oberkörper-Workout',
      progress: 45, // Fortschrittsbalken in Prozent
    }
  
    monthlyStats.value = {
      completedWorkouts: 5,
      remainingWorkouts: 3,
    }
  
    recommendedExercises.value = [
      { id: 1, name: 'Kniebeugen', description: 'Kräftigt Beine und Rumpf.' },
      { id: 2, name: 'Liegestütze', description: 'Trainiert Brust, Arme und Schulter.' },
    ]
  }
  
  /**
   * Abbrechen des Bearbeitungsmodus
   */
  function cancelEdit() {
    editMode.value = false
  }
  
  /**
   * Speichert die geänderten Profildaten in Supabase
   */
  async function saveProfile() {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      router.push('/auth')
      return
    }
  
    try {
      const updates = {
        full_name: editProfileData.value.full_name,
        bio: editProfileData.value.bio,
        avatar_url: editProfileData.value.avatar_url,
        color_contrast: editProfileData.value.color_contrast,
        font_size: editProfileData.value.font_size,
        screenreader: editProfileData.value.screenreader
      }
  
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authData.user.id)
        .single()
  
      if (updateError) throw updateError
  
      // Lokalen State aktualisieren
      profile.value = { ...profile.value, ...updated }
  
      // Bearbeitungsmodus beenden
      editMode.value = false
    } catch (err) {
      console.error('Fehler beim Speichern des Profils:', err.message)
    }
  }
  </script>
  
  <style scoped>
  /* Zusätzliche Styles für Karten, Abstände etc. */
  .card-header {
    font-weight: 600;
  }
  
  /* Modal-Style (Bootstrap, gemischt mit unserem Code) */
  .modal.fade {
    opacity: 0;
    transition: opacity 0.15s linear;
  }
  .modal.show {
    opacity: 1;
  }
  
  .modal-backdrop {
    z-index: 1050; /* typical Bootstrap modal-backdrop z-index */
  }
  .modal-dialog {
    margin-top: 10vh; /* margin for vertical centering */
  }
  .btn-close {
    background: none;
    border: 0;
    font-size: 1.2rem;
  }
  </style>
  