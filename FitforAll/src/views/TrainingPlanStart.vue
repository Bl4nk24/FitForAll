<template>
  <div class="training-plan-start-page container my-5">
    <div class="main-layout">
      <!-- Left Column -->
      <div class="content-column">
        <div v-if="!showSummary && currentWorkout" class="current-workout">
          <!-- Video Section -->
          <div class="video-section">
            <div v-if="isYoutube(currentWorkout.video_url)" class="video-wrapper">
              <iframe :src="getEmbeddedUrl(currentWorkout.video_url)" class="video-iframe" frameborder="0"
                allowfullscreen></iframe>
            </div>
            <div v-else class="external-video-link">
              <a :href="currentWorkout.video_url" target="_blank" class="btn btn-outline-secondary">
                <i class="bi bi-link-45deg"></i> Video ansehen
              </a>
            </div>
          </div>

          <!-- Workout Details -->
          <div class="details-card">
            <h1 class="workout-title">{{ currentWorkout.name }}</h1>
            <p class="workout-description">{{ currentWorkout.description }}</p>
          </div>

          <!-- Navigation -->
          <div class="navigation-buttons">
            <button @click="previousWorkout" :disabled="currentWorkoutIndex === 0" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left"></i> Vorherige Übung
            </button>
            <button @click="nextWorkout" class="btn btn-outline-primary">
              <span v-if="currentWorkoutIndex === workouts.length - 1">Workout beenden</span>
              <span v-else>Nächste Übung <i class="bi bi-arrow-right"></i></span>
            </button>
          </div>
        </div>

        <!-- Zusammenfassung anzeigen -->
        <div v-else-if="showSummary" class="summary-container">
          <div class="summary-card">
            <h2 class="mb-4">Workout abgeschlossen! 🎉</h2>

            <!-- Muskelkarte -->
            <div class="muscle-map-summary mb-5" v-if="svgContent" v-html="getSummaryMuscles"></div>

            <!-- Statistiken -->
            <div class="stats mb-4">
              <h4 class="mb-3">Deine Leistung:</h4>
              <div class="stat-item">
                <i class="bi bi-lightning-charge"></i>
                <span>Gesamtvolumen: {{ totalVolume }} kg</span>
              </div>
              <div class="stat-item">
                <i class="bi bi-heart-pulse"></i>
                <span>Trainierte Muskelgruppen: {{ trainedMuscles.length }}</span>
              </div>
            </div>

            <!-- Danke-Nachricht -->
            <div class="thank-you-message mb-4">
              <p>Danke für dein Training! Weiter so!</p>
            </div>

            <button class="btn btn-success btn-lg" @click="finishWorkout">
              Workout vollständig beenden <!-- Text angepasst -->
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="sidebar-column">
        <!-- Muscle Map Card -->
        <div class="sidebar-card muscle-card">
          <h3 class="card-title">
            <i class="bi bi-heart-pulse"></i> Beanspruchte Muskeln
          </h3>
          <div class="muscle-map-container" v-if="svgContent" v-html="getHighlightedMuscles(currentWorkout.id)"></div>
        </div>

        <!-- Training Log Card -->
        <div class="sidebar-card training-form">
          <h3 class="card-title">
            <i class="bi bi-clipboard-plus"></i> Training protokollieren
          </h3>

          <!-- Notes -->
          <div class="notes-section">
            <textarea v-model="sessionNote" class="form-control" rows="3"
              placeholder="Notizen zur Übung (z.B. Ausführungsfehler, Schmerzen...)"></textarea>
          </div>

          <!-- Sets -->
          <div class="sets-section">
            <div class="sets-header">
              <h4>Sätze</h4>
              <button @click="addSet" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-plus-lg"></i> Satz hinzufügen
              </button>
            </div>

            <div v-for="(set, index) in currentSets" :key="set.id" class="set-entry">
              <div class="set-number">#{{ index + 1 }}</div>
              <input type="number" v-model.number="set.reps" class="form-control" placeholder="Wdh."
                :disabled="set.completed" />
              <input type="number" v-model.number="set.weight" class="form-control" placeholder="kg"
                :disabled="set.completed" />
              <button class="btn btn-success set-action" @click="completeSet(index)"
                :disabled="set.completed || !set.reps || !set.weight">
                <i v-if="set.completed" class="bi bi-check-circle-fill"></i>
                <span v-else>✓</span>
              </button>
              <button class="btn btn-danger set-action" @click="deleteSet(index)" :disabled="set.completed">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Timer -->
          <div v-if="timerActive" class="timer-section">
            <div class="timer-display">
              <i class="bi bi-stopwatch"></i> {{ formattedTimer }}
              <div class="timer-controls">
                <button @click="decreaseTimer" class="btn btn-sm btn-outline-secondary">
                  -15s
                </button>
                <button @click="skipTimer" class="btn btn-sm btn-outline-danger">
                  Überspringen
                </button>
                <button @click="increaseTimer" class="btn btn-sm btn-outline-secondary">
                  +15s
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { v4 as uuidv4 } from 'uuid' // Für die Generierung von UUIDs

// Route-Parameter
const route = useRoute()
const router = useRouter()
const planId = route.params.planId

// Loading & Error States
const loading = ref(true)
const errorMessage = ref('')

// Authentifizierter Benutzer
const authUser = ref(null)

// Trainingsplan Daten
const planData = reactive({
  days: []
})

// SVG für die Muskelkarte
const summarySvg = ref('')

// Workouts
const workouts = ref([])

// Aktuelles Workout
const currentWorkoutIndex = ref(0)
const currentWorkout = computed(() => workouts.value[currentWorkoutIndex.value] || null)

// SVG-Inhalt
const svgContent = ref('')

// Sets für das aktuelle Workout
const currentSets = ref([])

// Notizen für die aktuelle Trainingssession
const sessionNote = ref('')

// Timer
const timerActive = ref(false)
const timerSeconds = ref(0)
const timerMinutes = ref(3) // Initiale Timerzeit auf 3 Minuten gesetzt
let timerInterval = null

// Trainingssession ID
const trainingSessionId = ref(null)

// Formatierung des Timers
const formattedTimer = computed(() => {
  const minutes = timerMinutes.value.toString().padStart(2, '0')
  const seconds = timerSeconds.value.toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

// State-Variable für die Zusammenfassung
const showSummary = ref(false)

// Computed Property: Gesamtgewicht berechnen
const totalVolume = computed(() => {
  return currentSets.value.reduce((sum, set) => {
    return sum + (set.reps || 0) * (set.weight || 0)
  }, 0)
})

function isLastSet(index) {
  return index === currentSets.value.length - 1
}

// Neue Reactive Variable für abgeschlossene Muskeln
const completedMuscles = reactive(new Set())

// Computed Property anpassen
const allTrainedMuscles = computed(() => {
  return Array.from(completedMuscles)
})

// Zusammenfassungs-Statistik anpassen
const trainedMuscles = computed(() => {
  return allTrainedMuscles.value
})

function getHighlightedMuscles(workoutId) {
  if (!svgContent.value) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')

  // Alle .active Klassen entfernen
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))

  // Aktuelles Workout hervorheben
  const workout = workouts.value.find(w => w.id === workoutId)
  if (workout && workout.target_muscles) {
    workout.target_muscles.forEach(muscleId => {
      const muscleEl = doc.getElementById(muscleId)
      if (muscleEl) muscleEl.classList.add('active')
    })
  }

  return doc.documentElement.outerHTML
}

// Funktion zum Laden der Muscle_Map.svg
async function loadMuscleSVG() {
  try {
    const response = await fetch('/assets/Muscle_Map.svg')
    svgContent.value = await response.text()
  } catch (error) {
    console.error('Fehler beim Laden der Muscle_Map.svg:', error)
  }
}

// Funktion zur Initialisierung der Sets für ein Workout
async function initializeSets(workoutId) {
  try {
    // Neueste Session holen
    const { data: sessions, error: sessionErr } = await supabase
      .from('training_sessions')
      .select('id, note, created_at')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (sessionErr) {
      console.error('Fehler beim Laden der Session:', sessionErr);
      return;
    }
    if (!sessions || sessions.length === 0) {
      console.log('Keine Session gefunden');
      currentSets.value = Array.from({ length: 3 }, () => ({
        id: uuidv4(),
        reps: null,
        weight: null,
        completed: false
      }));
      // Reset trainingSessionId für ein neues Workout
      trainingSessionId.value = null
      return;
    }

    const lastSessionId = sessions[0].id;
    trainingSessionId.value = lastSessionId

    // Sätze zu dieser Session laden
    const { data: setsData, error: setsErr } = await supabase
      .from('training_session_sets')
      .select('reps, weight')
      .eq('training_session_id', lastSessionId)
      .order('created_at', { ascending: true });

    if (setsErr) {
      console.error('Fehler beim Laden der Sätze:', setsErr);
      return;
    }

    // Sätze initialisieren
    const maxSets = setsData && setsData.length > 0 ? setsData.length : 3;
    currentSets.value = Array.from({ length: maxSets }, (_, i) => ({
      id: uuidv4(),
      reps: setsData[i]?.reps ?? null,
      weight: setsData[i]?.weight ?? null,
      completed: false
    }));
  } catch (err) {
    console.error('initializeSets() Fehler:', err);
  }
}

// Funktion zum Eintragen eines Satzes
function completeSet(index) {
  if (!currentSets.value[index].reps || !currentSets.value[index].weight) {
    alert('Bitte sowohl Wiederholungen als auch Gewicht eingeben.')
    return
  }

  // Set als abgeschlossen markieren
  currentSets.value[index].completed = true

  // Startet den Timer nach dem Eintragen eines Satzes
  startTimer()

  // Überprüfen, ob es der letzte Satz ist
  if (isLastSet(index)) {
    enduebung()
  }
}

// Funktion zum Löschen eines Satzes
function deleteSet(index) {
  currentSets.value.splice(index, 1)
}

// Funktion zum Speichern aller Sätze am Ende des Workouts und Anzeige der Zusammenfassung
async function enduebung() {
  try {

    // Trainingssession erstellen, wenn sie noch nicht existiert
    const sessionId = uuidv4()
    const { error: sessionError } = await supabase
      .from('training_sessions')
      .insert({
        id: sessionId,
        user_id: authUser.value.id,
        workout_id: currentWorkout.value.id,
        note: sessionNote.value, // Optional: Notiz einfügen, falls gewünscht
        created_at: new Date().toISOString()
      })
    if (sessionError) throw sessionError
    trainingSessionId.value = sessionId


    // Alle Sätze speichern
    const setsToSave = currentSets.value.map(set => ({
      id: set.id,
      training_session_id: trainingSessionId.value,
      reps: set.reps,
      weight: set.weight,
      created_at: new Date().toISOString()
    }))

    const { error: setError } = await supabase
      .from('training_session_sets')
      .insert(setsToSave)

    if (setError) throw setError

    // Muskeln zum Set hinzufügen
    if (currentWorkout.value?.target_muscles) {
      currentWorkout.value.target_muscles.forEach(muscle => {
        completedMuscles.add(muscle)
      })
    }

    // Nächstes Workout anzeigen
    nextWorkout()

  } catch (err) {
    console.error('Fehler beim Speichern des Workouts:', err)
  }
}

// Funktion zum Starten des 3-Minuten-Timers
function startTimer() {
  if (timerActive.value) return

  timerActive.value = true
  timerMinutes.value = 3
  timerSeconds.value = 0

  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      if (timerMinutes.value > 0) {
        timerMinutes.value--
        timerSeconds.value = 59
      } else {
        clearInterval(timerInterval)
        timerActive.value = false

        // Nach Ablauf des Timers zum nächsten Workout wechseln, falls alle Sätze abgeschlossen sind
        if (isLastSetOfCurrentWorkout()) {
          nextWorkout()
        }
      }
    }
  }, 1000)
}

// Funktion zum Überspringen des Timers
function skipTimer() {
  clearInterval(timerInterval)
  timerActive.value = false

  // Nur zur Zusammenfassung springen, wenn letztes Workout
  if (currentWorkoutIndex.value === workouts.value.length - 1) {
    showSummary.value = true
  }
}

function isYoutube(url) {
  return url.includes('youtube.com')
}

function getEmbeddedUrl(url) {
  const videoId = url.split('v=')[1]
  return `https://www.youtube.com/embed/${videoId}`;
}

// Funktion zum Erhöhen des Timers um 15 Sekunden
function increaseTimer() {
  timerSeconds.value += 15
  if (timerSeconds.value >= 60) {
    timerMinutes.value += Math.floor(timerSeconds.value / 60)
    timerSeconds.value = timerSeconds.value % 60
  }
}

// Funktion zum Verringern des Timers um 15 Sekunden
function decreaseTimer() {
  timerSeconds.value -= 15
  if (timerSeconds.value < 0) {
    if (timerMinutes.value > 0) {
      timerMinutes.value -= 1
      timerSeconds.value = 60 + timerSeconds.value
    } else {
      timerSeconds.value = 0
    }
  }
}

// Computed Property: Überprüfen, ob alle Sätze abgeschlossen sind
const allSetsCompleted = computed(() => {
  return currentSets.value.length > 0 && currentSets.value.every(set => set.completed)
})

// Funktion zum Hinzufügen eines neuen Satzes
function addSet() {
  currentSets.value.push({
    id: uuidv4(),
    reps: null,
    weight: null,
    completed: false
  })
}

// Navigation: Zum vorherigen Workout wechseln
function previousWorkout() {
  if (currentWorkoutIndex.value > 0) {
    currentWorkoutIndex.value--
    initializeSets(currentWorkout.value.id)
    // Reset trainingSessionId beim Wechsel
    trainingSessionId.value = null
  }
}

// Navigation: Zum nächsten Workout wechseln
function nextWorkout() {
  if (currentWorkoutIndex.value < workouts.value.length - 1) {
    currentWorkoutIndex.value++
    initializeSets(currentWorkout.value.id)
    trainingSessionId.value = null
  } else {
    // Erst nach dem letzten Workout Zusammenfassung anzeigen
    showSummary.value = true
  }
}

// Funktion zum endgültigen Beenden des Workouts
function finishWorkout() {
  router.push('/training-plans')
}

// Computed Property: SVG für die Zusammenfassung
const getSummaryMuscles = computed(() => {
  if (!svgContent.value) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')

  // Alle .active Klassen entfernen
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))

  // Alle gesammelten Muskelgruppen aktivieren
  allTrainedMuscles.value.forEach(muscleId => {
    const muscleEl = doc.getElementById(muscleId)
    if (muscleEl) muscleEl.classList.add('active')
  })

  return doc.documentElement.outerHTML
})

function generateSummaryMuscles() {
  if (!svgContent.value) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))

  // Nur completedMuscles verwenden
  completedMuscles.forEach(muscleId => {
    const muscleEl = doc.getElementById(muscleId)
    if (muscleEl) muscleEl.classList.add('active')
  })

  return doc.documentElement.outerHTML
}

// Lade Trainingsplan und Workouts
onMounted(async () => {
  try {
    // Benutzer-Authentifizierung
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Du bist nicht eingeloggt.')
    }

    authUser.value = authData.user

    // Trainingsplan laden
    const { data: planRow, error: planError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', planId)
      .single()
    if (planError) throw planError
    if (!planRow) throw new Error('Trainingsplan nicht gefunden.')

    // Plan-Daten parsen
    Object.assign(planData, planRow.plan_data)

    // Workouts laden
    const workoutIds = []
    planData.days.forEach(day => {
      if (day.workouts && day.workouts.length > 0) {
        workoutIds.push(...day.workouts)
      }
    })

    // Doppelte IDs entfernen
    const uniqueWorkoutIds = Array.from(new Set(workoutIds))

    if (uniqueWorkoutIds.length === 0) {
      throw new Error('Keine Workouts im Trainingsplan gefunden.')
    }

    const { data: workoutsData, error: wError } = await supabase
      .from('workouts')
      .select('*')
      .in('id', uniqueWorkoutIds)

    if (wError) throw wError

    workouts.value = workoutsData || []

    // Initialisiere die Sets für das erste Workout
    if (workouts.value.length > 0) {
      initializeSets(workouts.value[0].id)
    }

    // SVG laden
    await loadMuscleSVG()
  } catch (err) {
    console.error(err)
    errorMessage.value = err.message || 'Fehler beim Laden des Trainingsplans.'
  } finally {
    loading.value = false
  }
})

// Bereinigen des Timers beim Zerstören der Komponente
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>


<style scoped>
/* Base Styles */
.training-plan-start-page {
  min-height: 100vh;
  padding: 2rem 0;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Left Column Styles */
.content-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.video-section {
  background: #000;
  position: relative;
  padding-top: 56.25%;
  /* 16:9 */
  border-radius: 1rem;
  overflow: hidden;
}

.video-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.details-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.workout-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.workout-description {
  color: #666;
  line-height: 1.6;
}

/* Right Column Styles */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Training Form Styles */
.sets-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.set-entry {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 40px 40px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: #f8f9fa;
}

.set-number {
  font-weight: 500;
  color: #666;
  text-align: center;
}

.set-action {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

/* Timer Styles */
.timer-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c3e50;
}

.timer-controls {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.navigation-buttons .btn {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
    max-width: 800px;
  }

  .sidebar-column {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .set-entry {
    grid-template-columns: 30px 1fr 1fr 30px 30px;
    gap: 0.5rem;
  }

  .set-action {
    width: 30px;
    height: 30px;
  }

  .navigation-buttons .btn span {
    display: none;
  }

  .card-title {
    font-size: 1rem;
  }
}
</style>