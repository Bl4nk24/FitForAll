<template>
  <div class="training-plan-page">
    <!-- Hero-Bereich -->
    <section class="plan-hero text-center py-5 mb-4">
      <div class="container">
        <h1 class="display-4 fw-bold">
          Trainingsplan: {{ planNameDisplay }}
        </h1>
        <p class="lead">
          Übersicht aller Workouts in diesem Plan
        </p>
      </div>
    </section>

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
        <!-- Falls keine Tage vorhanden -->
        <div v-if="!planData.days || planData.days.length === 0" class="alert alert-info">
          Keine Tagesdaten vorhanden.
        </div>

        <!-- Tagesliste -->
        <div v-else>
          <div v-for="(day, dayIndex) in planData.days" :key="dayIndex" class="mb-5">
            <!-- Tages-Überschrift -->
            <h2 class="mb-3">
              {{ day.dayName ? day.dayName : 'Tag ' + (dayIndex + 1) }}
            </h2>

            <!-- Workouts des Tages -->
            <div class="row row-cols-1 row-cols-md-2 g-4">
              <div class="col" v-for="(workoutId, wIdx) in day.workouts" :key="wIdx">
                <div class="card h-100 workout-card">
                  <!-- Thumbnail als klickbarer Link -->
                  <router-link :to="`/workout/${workoutId}`" class="thumbnail-link">
                    <img :src="getYoutubeThumbnail(workoutMap[workoutId]?.video_url)" class="card-img-top"
                      alt="Thumbnail" />
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
                    <div class="muscle-map-container" v-if="svgContent" v-html="getHighlightedMuscles(workoutId)"></div>

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

// Route-Parameter
const route = useRoute()
const planId = route.params.planId

// Loading & Error
const loading = ref(true)
const errorMessage = ref('')

// Reaktive Daten
const planNameDisplay = ref('')
const planData = reactive({ days: [] })
const workoutMap = reactive({})
const lastSessions = reactive({})

// Hier speichern wir den reinen SVG-String
const svgContent = ref('')

onMounted(async () => {
  loading.value = true
  try {
    // 1) Plan laden
    const { data: planRow, error: planError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', planId)
      .single()
    if (planError) throw planError
    if (!planRow) throw new Error('Plan nicht gefunden.')

    planNameDisplay.value = planRow.plan_name || 'Unbenannter Plan'
    Object.assign(planData, planRow.plan_data)

    // 2) Alle Workouts laden
    const { data: workoutsData, error: wError } = await supabase
      .from('workouts')
      .select('id, name, description, video_url, target_muscles, equipment')
    if (wError) throw wError

    workoutsData.forEach(w => {
      workoutMap[w.id] = w
    })

    // 3) Letzte Trainings laden
    await loadLastSessions()

    // 4) Muscle SVG laden (einmalig)
    await loadMuscleSVG()
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
})

async function loadLastSessions() {
  try {
    // User
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return

    const allIds = new Set()
    planData.days.forEach(d => {
      d.workouts.forEach(w => allIds.add(w))
    })
    const workoutIdArray = [...allIds]
    if (!workoutIdArray.length) return

    // Sessions
    const { data: sessionsData } = await supabase
      .from('training_sessions')
      .select('id, created_at, workout_id')
      .eq('user_id', userData.user.id)
      .in('workout_id', workoutIdArray)
      .order('created_at', { ascending: false })
    if (!sessionsData?.length) return

    // Sets
    const sIds = sessionsData.map(s => s.id)
    const { data: setsData } = await supabase
      .from('training_session_sets')
      .select('training_session_id, reps, weight')
      .in('training_session_id', sIds)
    if (!setsData) return

    // Neueste Session
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

// 4) SVG laden
async function loadMuscleSVG() {
  try {
    const res = await fetch('/assets/Muscle_Map.svg')
    svgContent.value = await res.text()
  } catch (err) {
    console.error('Fehler beim Laden der Muscle_Map:', err)
  }
}

/**
 * Erzeugt eine "kopierte" SVG pro Workout, in der nur dessen Zielmuskeln aktiv sind.
 * Wir parsen svgContent neu, fügen .active-Klasse bei den relevanten IDs hinzu, returnen das OuterHTML.
 */
function getHighlightedMuscles(workoutId) {
  if (!svgContent.value) return '' // Falls noch nicht geladen

  // 1) Kopie des SVG als DOM-Objekt
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')

  // 2) alle .active entfernen
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))

  // 3) dieses Workout => target_muscles
  const muscles = workoutMap[workoutId]?.target_muscles || []
  muscles.forEach(mId => {
    const muscleEl = doc.getElementById(mId)
    if (muscleEl) muscleEl.classList.add('active')
  })

  // 4) als HTML-String zurückgeben
  return doc.documentElement.outerHTML
}

/* Hilfsfunktionen */
function hasTargetMuscles(workoutId) {
  const w = workoutMap[workoutId]
  return w && w.target_muscles && w.target_muscles.length > 0
}

function excerpt(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
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

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}
</script>

<style scoped>
.plan-hero {
  background: var(--videospage-bg, #007bff);
  background-image: linear-gradient(rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.2)), var(--videospage-bg, #007bff);
  color: #fff;
  border-radius: 0 0 10px 10px;
}

.loading-section {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

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

/* muscle-map */
.muscle-map-container {
  margin-top: 1rem;
  /* ggf. Rahmen: border: 1px solid #ccc; padding: 1rem; */
}

.muscle-map-container svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

/* Style für "aktive" Muskeln */
.active {
  fill: #ff5252 !important;
  stroke: #ff5252 !important;
  transition: all 0.2s;
}
</style>
