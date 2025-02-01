<template>
  <div class="manual-plan-modal">
    <!-- Hintergrund -->
    <div class="modal-backdrop" @click="closeModal"></div>

    <!-- Container mit Click-Stop -->
    <div class="modal-container" @click.stop>
      <div class="card shadow-lg modal-card">
        <!-- Header -->
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Manuellen Trainingsplan erstellen</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>

        <!-- Body-Scroller -->
        <div class="modal-body-scroller">
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
          <div class="row row-cols-1 row-cols-md-2 g-3">
            <div class="col" v-for="workout in allWorkouts" :key="workout.id">
              <div
                class="card h-100"
                :class="{'border-primary': isSelectedWorkout(workout.id)}"
                @click="toggleWorkout(workout.id)"
                style="cursor: pointer;"
              >
                <img
                  :src="getYoutubeThumbnail(workout.video_url)"
                  class="card-img-top"
                  :alt="workout.name"
                  style="object-fit: cover; height: 150px;"
                />
                <div class="card-body">
                  <h6 class="card-title mb-0">{{ workout.name }}</h6>
                </div>
              </div>
            </div>
          </div>

          <!-- Fehlermeldung -->
          <div v-if="planError" class="alert alert-warning mt-3">
            {{ planError }}
          </div>
        </div>

        <!-- Footer (fix unten) -->
        <div class="card-footer d-flex justify-content-end">
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

// Eingabefeld für den Plannamen (UI/UX)
const planName = ref('')

// Fehleranzeige
const planError = ref('')

// User
const userId = ref(null)

// Beim Laden: Auth prüfen, Workouts laden und einen Tag anlegen
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
.manual-plan-modal {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 10;
}

.modal-container {
  position: relative;
  z-index: 20;
  width: 100%;
  max-width: 900px;
  margin: auto;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-card {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.modal-body-scroller {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1rem;
}

.card.border-primary {
  border: 2px solid #0d6efd;
}

.nav-tabs .nav-link {
  cursor: pointer;
}
</style>
