<template>
    <div class="container mt-5">
      <h2 class="mb-4">Dein personalisierter Trainingsplan</h2>
  
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Lade Workouts...</span>
        </div>
      </div>
  
      <div v-else>
        <p v-if="filteredWorkouts.length === 0" class="text-muted">
          Keine passenden Workouts gefunden. Bitte passe deine Einstellungen oder Workouts an.
        </p>
  
        <div class="row row-cols-1 row-cols-md-2 g-4" v-if="filteredWorkouts.length > 0">
          <div class="col" v-for="workout in filteredWorkouts" :key="workout.id">
            <div class="card h-100">
              <!-- Video-Einbettung -->
              <div class="ratio ratio-16x9">
                <video
                  :src="workout.video_url"
                  controls
                  :title="getVideoTitle(workout)"
                  :aria-label="getVideoAriaLabel(workout)"
                >
                  <!-- Fallback-Text für Browser ohne Video-Support -->
                  Dein Browser unterstützt das Video-Tag nicht.
                </video>
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ workout.name }}</h5>
                <p class="card-text">{{ workout.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { supabase } from '../supabase'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const loading = ref(true)
  const userLimitations = ref([])
  const allWorkouts = ref([])
  const filteredWorkouts = ref([])
  
  onMounted(async () => {
    // 1) Prüfen, ob User eingeloggt ist
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      // Falls kein User => Weiterleitung zum Login
      router.push('/auth')
      return
    }
  
    // 2) user_settings abrufen (physische Einschränkungen)
    const { data: settingsData, error: settingsError } = await supabase
      .from('user_settings')
      .select('physical_limitations')
      .eq('user_id', authData.user.id)
      .single()
  
    if (settingsError) {
      console.error('Fehler beim Laden der Einstellungen:', settingsError.message)
      loading.value = false
      return
    }
  
    userLimitations.value = settingsData?.physical_limitations || []
  
    // 3) Workouts aus DB laden
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
  
    if (workoutsError) {
      console.error('Fehler beim Laden der Workouts:', workoutsError.message)
      loading.value = false
      return
    }
  
    allWorkouts.value = workoutsData || []
  
    // 4) Filter anwenden:
    //    Zeige nur Workouts, deren 'limitations' kein Intersection mit userLimitations hat
    //    (d. h. der User hat "rollstuhl", und das Workout hat "rollstuhl" in 'limitations' => wird ausgeschlossen)
    filteredWorkouts.value = allWorkouts.value.filter((workout) => {
      if (!workout.limitations || workout.limitations.length === 0) {
        // Workout hat keine Einschränkungen, also geeignet
        return true
      }
      // Prüfen, ob es eine Überschneidung gibt
      const intersection = workout.limitations.filter((lim) => userLimitations.value.includes(lim))
      // Wenn intersection > 0, bedeutet das: Der User hat eine Einschränkung, die Workout ausschließt
      return intersection.length === 0
    })
  
    loading.value = false
  })
  
  /**
   * Liefert einen beschreibenden Titel für das Video (z. B. Name + Kurzinfo).
   * Für Screenreader & Tooltip.
   */
  function getVideoTitle(workout) {
    return `Video zu ${workout.name}`
  }
  
  /**
   * Liefert ein aria-label für das Video, das z. B. Aufschluss über Inhalte gibt.
   */
  function getVideoAriaLabel(workout) {
    // Du könntest hier noch "Dauer" oder "Ausführungsanweisungen" einbauen
    return `Video zur Übung ${workout.name}. ${workout.description}`
  }
  </script>
  
  <style scoped>
  .ratio {
    background-color: #000; /* dunkler Hintergrund hinter dem Video */
  }
  </style>
  