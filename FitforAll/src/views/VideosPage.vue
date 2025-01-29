<template>
  <div class="videos-page">
    <!-- Hero-Bereich -->
    <section class="videos-hero text-center py-5 mb-4">
      <div class="container">
        <h1 class="display-4 fw-bold">Deine Workout-Bibliothek</h1>
        <p class="lead">
          Finde Workouts, die zu dir passen – jederzeit und überall.
        </p>
      </div>
    </section>

    <!-- Inhalt -->
    <div class="container my-5">
      <!-- Fehlermeldung -->
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <!-- Ladeanzeige -->
      <div v-else-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Lade Workouts...</p>
      </div>

      <!-- Gefilterte Workouts -->
      <div v-else>
        <!-- Keine passenden Workouts -->
        <div v-if="filteredWorkouts.length === 0" class="alert alert-info">
          Keine passenden Workouts gefunden.
        </div>

        <!-- Grid aus Karten -->
        <div class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col" v-for="workout in filteredWorkouts" :key="workout.id">
            <div class="card h-100 shadow-sm position-relative">
              <!-- Vorschaubild (YouTube-Thumbnail) -->
              <router-link :to="`/workout/${workout.id}`">
                <img
                  :src="getYoutubeThumbnail(workout.video_url)"
                  class="card-img-top"
                  alt="Workout Thumbnail"
                  style="max-height: 180px; object-fit: cover; cursor: pointer;"
                />
              </router-link>

              <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-2">{{ workout.name }}</h5>
                <p class="card-text">
                  {{ excerpt(workout.description, 80) }}
                </p>
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

  // 1) Auth-Check
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    errorMessage.value = 'Du bist nicht eingeloggt.'
    loading.value = false
    return
  }

  // 2) problem_muscle_groups
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

  // 3) Alle Workouts laden
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

  // 4) Filter: Workouts ohne Overlap mit userProblemMuscles
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
  color: #fff;
  border-radius: 0 0 10px 10px;
  background-image: linear-gradient(
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2)
  ), 
  var(--videospage-bg, #007bff);
}

.container {
  max-width: 900px;
}

.card {
  border-radius: 6px;
}

.card .card-body {
  display: flex;
  flex-direction: column;
}
</style>
