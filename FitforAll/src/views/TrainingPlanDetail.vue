<template>
  <div class="training-plan-page">
    <div class="container my-5" style="max-width: 900px;">
      <!-- Fehlermeldung -->
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <!-- Ladeanzeige -->
      <div v-else-if="loading" class="text-center loading-section">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 fw-semibold">Lade Trainingsplan...</p>
      </div>

      <!-- Plan-Inhalt -->
      <div v-else>
        <!-- Überschrift -->
        <div class="plan-header text-center mb-4">
          <h1 class="display-5 fw-bold">{{ planNameDisplay }}</h1>
          <p class="lead">Übersicht aller Workouts in diesem Plan</p>
          <!-- Training starten Button -->
          <div v-if="firstWorkoutId" class="mt-3">
            <router-link :to="`/training-plans/${planId}/start`" class="btn btn-lg btn-success">
              Training starten
            </router-link>
          </div>
        </div>

        <!-- Falls keine Tage vorhanden -->
        <div v-if="!planData.days || planData.days.length === 0" class="alert alert-info">
          Keine Tagesdaten vorhanden.
        </div>

        <!-- Tagesliste -->
        <div v-else>
          <div v-for="(day, dayIndex) in planData.days" :key="dayIndex" class="mb-5">
            <div class="row row-cols-1 row-cols-md-2 g-4">
              <div class="col" v-for="(workoutId, wIdx) in day.workouts" :key="wIdx">
                <div class="card h-100 workout-card">
                  <!-- Thumbnail als klickbarer Link -->
                  <router-link :to="`/workout/${workoutId}`" class="thumbnail-link">
                    <img
                      :src="getYoutubeThumbnail(workoutMap[workoutId]?.video_url)"
                      class="card-img-top"
                      alt="Thumbnail"
                    />
                  </router-link>
                  <div class="card-body d-flex flex-column">
                    <!-- Name & Beschreibung -->
                    <h5 class="card-title">
                      {{ workoutMap[workoutId]?.name || 'Unbekanntes Workout' }}
                    </h5>
                    <p class="card-text text-muted">
                      {{ excerpt(workoutMap[workoutId]?.description, 60) }}
                    </p>

                    <!-- Zielmuskeln direkt anzeigen -->
                    <div v-if="hasTargetMuscles(workoutId)" class="mb-3">
                      <strong>Beanspruchte Muskeln:</strong>
                    </div>

                    <!-- Muskelkarte (SVG) direkt unter dem Video -->
                    <div
                      class="muscle-map-container"
                      v-if="svgContent"
                      v-html="getHighlightedMuscles(workoutId)"
                    ></div>

                    <!-- Letztes Training -->
                    <div class="last-training mt-auto" v-if="lastSessions[workoutId]">
                      <hr />
                      <h6 class="text-primary">Letztes Training:</h6>
                      <p class="mb-1">
                        <small class="text-muted">
                          {{ formatDate(lastSessions[workoutId].date) }}
                        </small>
                      </p>
                      <ul class="list-unstyled">
                        <li v-for="(set, sIndex) in lastSessions[workoutId].sets" :key="sIndex">
                          {{ set.reps }} Wdh. x {{ set.weight }} kg
                        </li>
                      </ul>
                    </div>
                    <div class="text-muted mt-auto" v-else>
                      <hr />
                      <p>Kein Training vorhanden</p>
                    </div>

                    <!-- Button zum Workout -->
                    <router-link :to="`/workout/${workoutId}`" class="btn btn-primary mt-3">
                      Workout ansehen
                    </router-link>
                  </div>
                </div>
                <!-- /Workout-Card -->
              </div>
            </div>
          </div>
        </div>

        <!-- Zurück-Button -->
        <router-link to="/training-plans" class="btn btn-outline-primary mt-4">
          Zur Trainingsplan-Übersicht
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'

const route = useRoute()
const planId = route.params.planId

const loading = ref(true)
const errorMessage = ref('')

const planNameDisplay = ref('')
const planData = reactive({ days: [] })
const workoutMap = reactive({})
const lastSessions = reactive({})

const svgContent = ref('')

const firstWorkoutId = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    // Plan laden
    const { data: planRow, error: planError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', planId)
      .single()
    if (planError) throw planError
    if (!planRow) throw new Error('Plan nicht gefunden.')

    planNameDisplay.value = planRow.plan_name || 'Unbenannter Plan'
    Object.assign(planData, planRow.plan_data)

    // Alle Workouts laden
    const { data: workoutsData, error: wError } = await supabase
      .from('workouts')
      .select('id, name, description, video_url, target_muscles, equipment')
    if (wError) throw wError
    workoutsData.forEach(w => {
      workoutMap[w.id] = w
    })

    for (const day of planData.days) {
      if (day.workouts && day.workouts.length > 0) {
        firstWorkoutId.value = day.workouts[0]
        break
      }
    }

    await loadLastSessions()
    await loadMuscleSVG()
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
})

async function loadLastSessions() {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return

    const allIds = new Set()
    planData.days.forEach(d => {
      d.workouts.forEach(w => allIds.add(w))
    })
    const workoutIdArray = [...allIds]
    if (!workoutIdArray.length) return

    const { data: sessionsData } = await supabase
      .from('training_sessions')
      .select('id, created_at, workout_id')
      .eq('user_id', userData.user.id)
      .in('workout_id', workoutIdArray)
      .order('created_at', { ascending: false })
    if (!sessionsData?.length) return

    const sIds = sessionsData.map(s => s.id)
    const { data: setsData } = await supabase
      .from('training_session_sets')
      .select('training_session_id, reps, weight')
      .in('training_session_id', sIds)
    if (!setsData) return

    workoutIdArray.forEach(wId => {
      const latest = sessionsData.find(s => s.workout_id === wId)
      if (!latest) return
      const relevantSets = setsData.filter(x => x.training_session_id === latest.id)
      lastSessions[wId] = {
        date: latest.created_at,
        sets: relevantSets
      }
    })
  } catch (err) {
    console.error('Fehler bei loadLastSessions:', err)
  }
}

async function loadMuscleSVG() {
  try {
    const res = await fetch('/assets/Muscle_Map.svg')
    svgContent.value = await res.text()
  } catch (err) {
    console.error('Fehler beim Laden der Muscle_Map:', err)
  }
}

function excerpt(text, maxLength) {
  if (!text) return ''
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
}

function getYoutubeThumbnail(url) {
  if (!url) return '/fallback-thumbnail.jpg'
  try {
    let match = url.match(/[?&]v=([^&]+)/)
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/0.jpg`
    }
    match = url.match(/youtu\.be\/([^?]+)/)
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/0.jpg`
    }
    return '/fallback-thumbnail.jpg'
  } catch {
    return '/fallback-thumbnail.jpg'
  }
}

function hasTargetMuscles(workoutId) {
  const w = workoutMap[workoutId]
  return w && w.target_muscles && w.target_muscles.length > 0
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

/**
 * getHighlightedMuscles(workoutId):
 * Parst die Muscle-Map-SVG und hebt die Zielmuskeln des Workouts hervor.
 */
function getHighlightedMuscles(workoutId) {
  if (!svgContent.value) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))
  const muscles = workoutMap[workoutId]?.target_muscles || []
  muscles.forEach(mId => {
    const muscleEl = doc.getElementById(mId)
    if (muscleEl) muscleEl.classList.add('active')
  })
  return doc.documentElement.outerHTML
}

/**
 * getPlanSvg(plan):
 * Parst die Muscle-Map-SVG und hebt für alle in plan.muscleGroups enthaltenen Muskel-IDs diese hervor.
 */
function getPlanSvg(plan) {
  if (!svgContent.value) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))
  if (plan.muscleGroups && plan.muscleGroups.length > 0) {
    plan.muscleGroups.forEach(muscle => {
      const muscleEl = doc.getElementById(muscle)
      if (muscleEl) muscleEl.classList.add('active')
    })
  }
  return doc.documentElement.outerHTML
}
</script>

<style scoped>
/* Allgemeines Seitenlayout */
.training-plan-page {
  font-family: 'Poppins', sans-serif;
  background: #f5f7fa;
  padding-bottom: 2rem;
}

/* Hero-Bereich wurde entfernt – stattdessen einfache Header-Anzeige */
.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}
.plan-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.plan-header p {
  font-size: 1.2rem;
}

/* Hero-Aktion */
.hero-action {
  margin-top: 1.5rem;
}
.hero-action .btn {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
}

/* Container */
.container {
  max-width: 900px;
}

/* Workout Cards */
.workout-card {
  transition: transform 0.2s ease;
}
.workout-card:hover {
  transform: translateY(-2px);
}
.workout-card img {
  height: 150px;
  object-fit: cover;
}

/* Muscle-Map Container */
.muscle-map-container {
  margin-top: 1rem;
}
.muscle-map-container svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

/* Card-Übersicht */
.card {
  border: none;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-3px);
}

/* Texte */
.card-title,
.card-subtitle,
.card-text {
  font-family: 'Poppins', sans-serif;
}

/* Icons & Buttons */
.btn {
  border-radius: 50px;
  text-transform: none;
}
.thumbnail-link img {
  width: 100%;
}
.dropdown-menu li {
  cursor: pointer;
}

/* Basis-SVG-Muskelkarte */
.active {
  fill: #ff5252 !important;
  stroke: #ff5252 !important;
  transition: all 0.2s;
}

/* Spezifische Styles für Workout Cards */
.workout-card {
  border: 1px solid #e0e0e0;
}
</style>
