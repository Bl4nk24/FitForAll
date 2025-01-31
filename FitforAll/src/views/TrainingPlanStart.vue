<template>
  <div class="training-plan-start-page container my-5" style="max-width: 900px;">
    <!-- Ladezustand / Fehler -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Lade Trainingsplan...</p>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Hauptinhalt oder Zusammenfassung -->
    <div v-else>
      <!-- Aktuelles Workout anzeigen -->
      <div v-if="!showSummary && currentWorkout" class="current-workout">
        <!-- Workout Video -->
        <div class="video-section mb-4">
          <div v-if="isYoutube(currentWorkout.video_url)" class="video-wrapper">
            <iframe :src="getEmbeddedUrl(currentWorkout.video_url)" class="video-iframe" frameborder="0"
              allowfullscreen></iframe>
          </div>
          <div v-else class="external-video-link text-center">
            <a :href="currentWorkout.video_url" target="_blank" class="btn btn-outline-secondary">
              <i class="bi bi-link-45deg"></i> Video ansehen
            </a>
          </div>
        </div>

        <!-- Workout Details -->
        <div class="workout-details mb-4">
          <h2>{{ currentWorkout.name }}</h2>
          <p>{{ currentWorkout.description }}</p>
        </div>

        <!-- Muskelkarte -->
        <div class="muscle-map-container mb-4" v-if="svgContent" v-html="getHighlightedMuscles(currentWorkout.id)">
        </div>

        <!-- Sätze eintragen -->
        <div class="sets-section mb-4">
          <h4>Sätze eintragen</h4>
          <div v-for="(set, index) in currentSets" :key="set.id" class="set-entry d-flex align-items-center mb-2">
            <div class="me-3">
              <strong>Satz {{ index + 1 }}:</strong>
            </div>
            <input type="number" v-model.number="set.reps" class="form-control me-2" placeholder="Wdh."
              :disabled="set.completed" />
            <input type="number" v-model.number="set.weight" class="form-control me-2" placeholder="kg"
              :disabled="set.completed" />
            <button class="btn btn-success" @click="completeSet(index)"
              :disabled="set.completed || !set.reps || !set.weight">
              <i v-if="set.completed" class="bi bi-check-circle-fill"></i>
              <span v-else>Eintragen</span>
            </button>
            <button class="btn btn-danger ms-auto" @click="deleteSet(index)" :disabled="set.completed">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <button class="btn btn-outline-primary ms-2" @click="addSet">
            <i class="bi bi-plus-circle"></i> Satz hinzufügen
          </button>

          <!-- Pausentimer anzeigen -->
          <div v-if="timerActive" class="timer mt-3">
            <p>Pause: {{ formattedTimer }}</p>
            <div class="timer-controls">
              <button class="btn btn-sm btn-outline-primary me-2" @click="decreaseTimer">
                -15 Sek
              </button>
              <button class="btn btn-sm btn-outline-secondary me-2" @click="skipTimer">
                Überspringen
              </button>
              <button class="btn btn-sm btn-outline-primary" @click="increaseTimer">
                +15 Sek
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation zwischen Workouts -->
        <div class="navigation-buttons d-flex justify-content-between">
          <button class="btn btn-outline-secondary" @click="previousWorkout" :disabled="currentWorkoutIndex === 0">
            <i class="bi bi-arrow-left"></i> Vorherige Übung
          </button>
          <button class="btn btn-outline-secondary" @click="nextWorkout">
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
              <span>Trainierte Muskelgruppen: {{ allTrainedMuscles.length }}</span>
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

      <!-- Keine Workouts vorhanden -->
      <div v-else class="alert alert-info">
        Keine Workouts im Trainingsplan gefunden.
      </div>
    </div>

    <!-- Timer Bubble -->
    <div class="timer-bubble" v-if="timerActive">
      <p>Pause: {{ formattedTimer }}</p>
      <div class="timer-controls">
        <button class="btn btn-sm btn-outline-primary me-2" @click="decreaseTimer">
          -15 Sek
        </button>
        <button class="btn btn-sm btn-outline-secondary me-2" @click="skipTimer">
          Überspringen
        </button>
        <button class="btn btn-sm btn-outline-primary" @click="increaseTimer">
          +15 Sek
        </button>
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
      .select('id, created_at')
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
        note: '', // Optional: Notiz einfügen, falls gewünscht
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
.training-plan-start-page {
  min-height: 70vh;
}

.current-workout,
.summary-container {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.video-section {
  position: relative;
  padding-top: 56.25%;
  /* 16:9 Aspect Ratio */
  border-radius: 12px;
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
}

.workout-details {
  text-align: center;
}

.muscle-map-container,
.muscle-map-summary {
  margin-top: 1rem;
  /* Optional: border: 1px solid #ccc; padding: 1rem; */
}

.muscle-map-container svg,
.muscle-map-summary svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.sets-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.set-entry {
  display: flex;
  align-items: center;
}

.set-entry input {
  width: 80px;
}

.set-entry button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer {
  font-size: 2rem;
  /* Vergrößert den Timer weiter */
  font-weight: bold;
  color: #e74c3c;
}

.timer-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.navigation-buttons {
  margin-top: 2rem;
}

.navigation-buttons .btn {
  width: 48%;
}

.auto-next .btn {
  width: 100%;
}

.current-workout h2,
.summary-container h2 {
  margin-bottom: 0.5rem;
}

.current-workout p,
.summary-container .thank-you-message p {
  color: #555;
}

.sets-section h4,
.summary-container h4 {
  margin-bottom: 1rem;
}

.sets-section .form-control {
  width: 100px;
}

.sets-section .btn-success span {
  display: none;
}

.sets-section .btn-success .bi-check-circle-fill {
  display: inline;
}

.sets-section .btn-success:not(:disabled) span {
  display: inline;
}

.sets-section .btn-success:not(:disabled) .bi-check-circle-fill {
  display: none;
}

/* Responsive Anpassungen */
@media (max-width: 767px) {
  .navigation-buttons .btn {
    width: 100%;
    margin-bottom: 1rem;
  }

  .navigation-buttons .btn:last-child {
    margin-bottom: 0;
  }
}

/* Timer Bubble */
.timer-bubble {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  /* Leicht transparenter Hintergrund */
  border: 2px solid #007bff;
  border-radius: 12px;
  padding: 1.5rem;
  /* Größerer Padding für einen größeren Timer */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 300px;
}

.timer-bubble p {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  /* Weiter vergrößert die Schriftgröße */
  font-weight: bold;
  color: #007bff;
  text-align: center;
}

.timer-bubble .timer-controls {
  display: flex;
  justify-content: space-between;
}

/* Zusammenfassung Styles */
.summary-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-card {
  /* Optional: Zusätzliche Styles für die Zusammenfassung */
}

.muscle-map-summary {
  max-width: 400px;
  margin: 0 auto;
}

.stats {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-size: 1.1rem;
  margin: 1rem 0;
}

.stat-item i {
  font-size: 1.4rem;
  color: #007bff;
}

.btn-success {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.btn-success:hover {
  transform: scale(1.05);
}

.thank-you-message p {
  font-size: 1.2rem;
  color: #28a745;
  text-align: center;
}
</style>