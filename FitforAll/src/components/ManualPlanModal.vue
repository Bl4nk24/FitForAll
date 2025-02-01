<template>
  <div class="manual-plan-modal">
    <!-- Hintergrund -->
    <div class="modal-backdrop" @click="closeModal"></div>

    <!-- Modal-Container (Klicks außerhalb schließen) -->
    <div class="modal-container" @click.stop>
      <div class="card modal-card shadow-lg">
        <!-- Header -->
        <div class="card-header modal-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Manuellen Trainingsplan erstellen</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>

        <!-- Body mit Scrollfunktion -->
        <div class="modal-body modal-body-scroller">
          <!-- Eingabe für den Plannamen -->
          <div class="mb-3">
            <label class="form-label">Planname:</label>
            <input
              type="text"
              class="form-control"
              v-model="planName"
              placeholder="Gib den Plannamen ein"
            />
          </div>

          <p class="text-muted" v-if="allWorkouts.length === 0">
            Keine Workouts verfügbar (oder werden gerade geladen).
          </p>

          <!-- Grid der Workouts -->
          <div class="workout-grid">
            <div
              class="workout-card"
              v-for="workout in allWorkouts"
              :key="workout.id"
              :class="{ selected: isSelectedWorkout(workout.id) }"
              @click="toggleWorkout(workout.id)"
            >
              <img
                :src="getYoutubeThumbnail(workout.video_url)"
                class="workout-img"
                :alt="workout.name"
              />
              <div class="card-body">
                <h6 class="card-title mb-0">{{ workout.name }}</h6>
              </div>
              <!-- Größere SVG-Muskelkarte: Zeigt aktiv die Zielmuskeln dieses Workouts -->
              <div class="workout-muscle-map" v-if="svgContent" v-html="getWorkoutSvg(workout)"></div>
            </div>
          </div>

          <!-- Fehlermeldung -->
          <div v-if="planError" class="alert alert-warning mt-3">
            {{ planError }}
          </div>
        </div>

        <!-- Footer (fixiert am unteren Rand) -->
        <div class="card-footer modal-footer d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="closeModal">
            Abbrechen
          </button>
          <button class="btn btn-primary" @click="saveManualPlan">
            Plan speichern
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'

const emit = defineEmits(['close', 'plan-created'])

// Workouts
const allWorkouts = ref([])

// Array für Tage => { dayName: string, workouts: string[] }
// Auch wenn es nur einen Tag gibt, bleibt die Struktur gleich.
const days = ref([])
// Da es nur einen Tag gibt, ist der Index immer 0.
const selectedDayIndex = ref(0)

// Eingabefeld für den Plannamen
const planName = ref('')

// Fehleranzeige
const planError = ref('')

// User
const userId = ref(null)

// Basis-SVG-Muskelkarte (einmalig laden)
const svgContent = ref('')

// Beim Laden: Auth prüfen, Workouts laden, SVG laden und einen Tag anlegen
onMounted(async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Nicht eingeloggt, kein Plan kann erstellt werden.')
    }
    userId.value = authData.user.id

    const { data: wData, error: wError } = await supabase
      .from('workouts')
      .select('*')
    if (wError) throw wError
    allWorkouts.value = wData || []

    // SVG-Muskelkarte laden
    try {
      const response = await fetch("/assets/Muscle_Map.svg")
      svgContent.value = await response.text()
    } catch (svgError) {
      console.error("Fehler beim Laden der SVG:", svgError)
    }

    // Einen Tag hinzufügen – dieser wird im DB-Insert beibehalten.
    addDay()
  } catch (err) {
    planError.value = err.message
  }
})

// Da wir nur einen Tag haben, ist currentDay immer days[0]
const currentDay = computed(() => {
  if (!days.value.length) return null
  return days.value[selectedDayIndex.value] || null
})

// Einen Tag hinzufügen (nur einmal aufgerufen)
function addDay() {
  days.value.push({
    dayName: 'Tag 1',
    workouts: []
  })
  selectedDayIndex.value = 0
}

// Auswahl eines Workouts für den (einzigen) Tag umschalten
function toggleWorkout(workoutId) {
  if (!currentDay.value) return
  const arr = currentDay.value.workouts
  const idx = arr.indexOf(workoutId)
  if (idx === -1) arr.push(workoutId)
  else arr.splice(idx, 1)
}

function isSelectedWorkout(workoutId) {
  if (!currentDay.value) return false
  return currentDay.value.workouts.includes(workoutId)
}

// Modal schließen
function closeModal() {
  emit('close')
}

// Plan speichern – dabei bleibt die Struktur im Insert gleich.
async function saveManualPlan() {
  planError.value = ''
  if (!userId.value) {
    planError.value = 'Nicht eingeloggt.'
    return
  }
  if (!days.value.length) {
    planError.value = 'Bitte mindestens einen Tag hinzufügen.'
    return
  }
  if (!planName.value.trim()) {
    planError.value = 'Bitte einen Plannamen eingeben.'
    return
  }

  const plan_data = {
    days: days.value.map((d, i) => ({
      dayName: d.dayName || `Tag ${i + 1}`,
      workouts: d.workouts
    }))
  }

  const number_of_days = days.value.length
  const plan_name = planName.value.trim() || `Manueller Plan (${new Date().toLocaleDateString()})`

  try {
    const { data: inserted, error } = await supabase
      .from('training_plans')
      .insert({
        user_id: userId.value,
        plan_name,
        number_of_days,
        plan_data
      })
      .select('*')
      .single()

    if (error) {
      planError.value = 'Fehler beim Speichern: ' + error.message
      return
    }
    emit('plan-created', inserted)
    emit('close')
  } catch (err) {
    planError.value = 'Unerwarteter Fehler: ' + err.message
  }
}

/**
 * getWorkoutSvg(workout):
 * Parst die Basis-SVG-Muskelkarte und fügt für alle in workout.target_muscles
 * enthaltenen Muskel-IDs die CSS-Klasse "active" hinzu.
 */
function getWorkoutSvg(workout) {
  if (!svgContent.value) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')

  // Vorherige "active"-Klassen entfernen
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))

  // Falls für das Workout Zielmuskeln definiert sind, diese aktivieren
  if (workout.target_muscles && Array.isArray(workout.target_muscles)) {
    workout.target_muscles.forEach(muscle => {
      const muscleEl = doc.getElementById(muscle)
      if (muscleEl) {
        muscleEl.classList.add('active')
      }
    })
  }
  return doc.documentElement.outerHTML
}

// YouTube-Thumbnail (bleibt unverändert)
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
/* Grundlayout des Modals */
.manual-plan-modal {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
}

/* Halbtransparenter Hintergrund */
.modal-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* Container für das Modal */
.modal-container {
  position: relative;
  z-index: 20;
  width: 100%;
  max-width: 800px;
  margin: auto;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* Styling der Modal-Card */
.modal-card {
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

/* Header-Bereich */
.modal-header {
  background-color: #f7f7f7;
  padding: 1rem;
  border-bottom: 1px solid #eaeaea;
}

/* Body-Bereich mit Scrollfunktion */
.modal-body-scroller {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

/* Grid-Layout für die Workout-Cards */
.workout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Erhöhter minimaler Wert */
  gap: 1rem;
}

/* Styling für einzelne Workout-Cards */
.workout-card {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.workout-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.workout-card.selected {
  border-color: #0d6efd;
}

/* Styling für Workout-Bilder */
.workout-img {
  width: 100%;
  height: 200px; /* Erhöhte Höhe */
  object-fit: cover;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

/* Container für die SVG-Muskelkarte in der Workout-Card – vergrößert und zentriert */
.workout-muscle-map {
  width: 250px;  /* Größere Darstellung der SVG */
  margin: 0.5rem auto 0;
}
.workout-muscle-map svg {
  width: 100%;
  height: auto;
}

/* Footer-Bereich */
.modal-footer {
  background-color: #f7f7f7;
  padding: 0.75rem 1rem;
  border-top: 1px solid #eaeaea;
}

/* Responsive Anpassungen */
@media (max-width: 576px) {
  .modal-container {
    max-width: 95%;
  }
  .workout-img {
    height: 150px; /* Für kleinere Geräte eventuell etwas kleiner, je nach Bedarf */
  }
  .workout-muscle-map {
    width: 120px; /* Angepasste Größe für mobile Geräte */
  }
}
</style>
