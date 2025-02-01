<template>
  <div class="videos-page">
    <!-- Hero-Bereich -->
    <section class="videos-hero text-center py-5 mb-4">
      <div class="container">
        <h1 class="display-4 fw-bold">Deine Workout-Bibliothek</h1>
        <p class="lead">
          Finde Workouts, die zu dir passen &mdash; jederzeit und überall.
        </p>
      </div>
    </section>

    <!-- Inhalt -->
    <div class="container my-5">
      <!-- Fehlermeldung -->
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <!-- Ladeanzeige -->
      <div v-else-if="loading" class="text-center loading-section">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 fw-semibold">Lade Workouts...</p>
      </div>

      <!-- Gefilterte Workouts -->
      <div v-else>
        <!-- Keine passenden Workouts -->
        <div v-if="filteredWorkouts.length === 0" class="alert alert-info">
          Keine passenden Workouts gefunden.
        </div>

        <!-- Grid aus Karten -->
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div class="col" v-for="workout in filteredWorkouts" :key="workout.id">
            <!-- 
              1) Card mit fixer/limitierter Höhe
              2) shadow-sm + workout-card (für Hover-Effekt)
            -->
            <div class="card h-100 shadow-sm workout-card">
              <!-- Vorschaubild (YouTube-Thumbnail) -->
              <router-link :to="`/workout/${workout.id}`" class="thumbnail-link">
                <img 
                  :src="getYoutubeThumbnail(workout.video_url)" 
                  class="card-img-top" 
                  alt="Workout Thumbnail" 
                />
              </router-link>

              <!-- Card-Body mit Flex-Layout -->
              <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-2">{{ workout.name }}</h5>
                <!-- Kurzer Beschreibungstext (10 Zeichen + ...) -->
                <p class="card-text text-muted mb-2">
                  {{ excerpt(workout.description, 10) }}
                </p>

                <!-- Button am unteren Ende -->
                <router-link 
                  :to="`/workout/${workout.id}`" 
                  class="btn btn-primary mt-auto"
                >
                  Workout ansehen
                </router-link>
              </div>
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

const loading = ref(true)
const errorMessage = ref('')
const workouts = ref([])
const filteredWorkouts = ref([])

onMounted(async () => {
  loading.value = true
  errorMessage.value = ''

  // Auth-Check
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    errorMessage.value = 'Du bist nicht eingeloggt.'
    loading.value = false
    return
  }

  // user_problem_muscles laden
  let userProblemMuscles = []
  try {
    const { data: userSettingsData, error: userSettingsError } = await supabase
      .from('user_settings')
      .select('problem_muscle_groups')
      .eq('user_id', authData.user.id)
      .single()

    if (userSettingsError) throw userSettingsError
    userProblemMuscles = userSettingsData?.problem_muscle_groups || []
  } catch (err) {
    console.error('Fehler beim Laden der User-Settings:', err)
    errorMessage.value = 'Fehler beim Laden der Benutzerdaten.'
    loading.value = false
    return
  }

  // Alle Workouts laden
  try {
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')

    if (workoutsError) throw workoutsError
    workouts.value = workoutsData || []
  } catch (err) {
    console.error('Fehler beim Laden der Workouts:', err)
    errorMessage.value = 'Fehler beim Laden der Workouts.'
    loading.value = false
    return
  }

  // Filtern: nur Workouts ohne Overlap mit userProblemMuscles
  filteredWorkouts.value = workouts.value.filter((workout) => {
    const pm = workout.problem_muscle_groups || []
    return !pm.some((muscle) => userProblemMuscles.includes(muscle))
  })

  loading.value = false
})

function excerpt(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

function getYoutubeThumbnail(url) {
  if (!url) return '/fallback-thumbnail.jpg'
  try {
    let videoId = ''
    let match = url.match(/[?&]v=([^&]+)/)
    if (match && match[1]) {
      videoId = match[1]
    } else {
      match = url.match(/youtu\.be\/([^?]+)/)
      if (match && match[1]) {
        videoId = match[1]
      }
    }
    if (!videoId) {
      return '/fallback-thumbnail.jpg'
    }
    return `https://img.youtube.com/vi/${videoId}/0.jpg`
  } catch (err) {
    return '/fallback-thumbnail.jpg'
  }
}
</script>

<style scoped>
.videos-hero {
  background: var(--videospage-bg, #007bff);
  background-image: linear-gradient(
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2)
  ), var(--videospage-bg, #007bff);
  color: #fff;
  border-radius: 0 0 10px 10px;
}

/* Container-Anpassungen */
.container {
  max-width: 900px;
}

/* Ladeanzeige zentrieren */
.loading-section {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Karten-Stil (h-100 & shadow-sm in Template) */
.card {
  border-radius: 6px;
  overflow: hidden;
}

/* Bildhöhe festlegen (z.B. 100 oder 120 px) */
.card-img-top {
  height: 300px;
  object-fit: cover;
}

/* Flex-Layout fürs Card-Body, Button unten */
.card-body {
  display: flex;
  flex-direction: column;
  /* Damit Titel, Text, Button kompakt verteilt werden */
  padding: 0.75rem;
}

/* Hover-Effekt */
.workout-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* Router-Link fürs Bild */
.thumbnail-link {
  display: block;
  overflow: hidden;
}

/* Mobile Responsiveness */
@media (max-width: 767px) {
  /* Bild darf ruhig etwas größer auf Mobile sein */
  .card-img-top {
    height: 120px;
  }
}
</style>
