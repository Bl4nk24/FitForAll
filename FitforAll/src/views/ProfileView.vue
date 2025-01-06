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
  
  // Router
  const router = useRouter()
  
  onMounted(async () => {
    // 1) Sicherstellen, dass ein User eingeloggt ist
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      // Kein User => Weiterleitung zum Login
      return router.push('/auth')
    }
    userEmail.value = authData.user.email
  
    // 2) Profilinfos abrufen (hier Annahme: Die Tabelle heißt "profiles" und speichert erweiterte User-Daten)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
  
      if (profileError) throw profileError
  
      profile.value = profileData
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
  </script>
  
  <style scoped>
  /* Zusätzliche Styles für Karten, Abstände etc. */
  .card-header {
    font-weight: 600;
  }
  </style>
  