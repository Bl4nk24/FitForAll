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
          <!-- Tabs für die Tage -->
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item" v-for="(dayObj, idx) in days" :key="idx">
              <button
                class="nav-link"
                :class="{ active: idx === selectedDayIndex }"
                @click="selectedDayIndex = idx"
              >
                {{ dayObj.dayName || 'Neuer Tag' }}
              </button>
            </li>
            <li class="nav-item">
              <button class="btn btn-sm btn-success ms-2" @click="addDay">
                + Tag
              </button>
            </li>
          </ul>

          <!-- Aktueller Tag -->
          <div v-if="days.length > 0">
            <div class="d-flex align-items-center mb-3">
              <label class="form-label me-2" style="min-width:80px;">
                Tagesname:
              </label>
              <input
                type="text"
                class="form-control"
                style="max-width: 300px;"
                v-model="currentDay.dayName"
              />
              <button
                class="btn btn-outline-danger ms-3"
                v-if="days.length > 1"
                @click="removeDay(selectedDayIndex)"
              >
                Tag löschen
              </button>
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
const days = ref([])
const selectedDayIndex = ref(0)

// Fehler
const planError = ref('')

// User
const userId = ref(null)

// onMounted => Auth + Workouts laden => mind. 1 Tag
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

    addDay()
  } catch (err) {
    planError.value = err.message
  }
})

const currentDay = computed(() => {
  if (!days.value.length) return null
  return days.value[selectedDayIndex.value] || null
})

// Tag hinzufügen
function addDay() {
  const newIndex = days.value.length + 1
  days.value.push({
    dayName: `Tag ${newIndex}`,
    workouts: []
  })
  selectedDayIndex.value = days.value.length - 1
}

// Tag entfernen
function removeDay(index) {
  if (days.value.length <= 1) return
  days.value.splice(index, 1)
  if (selectedDayIndex.value >= days.value.length) {
    selectedDayIndex.value = days.value.length - 1
  }
}

// Toggle
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

// Modal
function closeModal() {
  emit('close')
}

// Speichern
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

  const plan_data = {
    days: days.value.map((d, i) => ({
      dayName: d.dayName || `Tag ${i + 1}`,
      workouts: d.workouts
    }))
  }

  const plan_name = `Manueller Plan (${new Date().toLocaleDateString()})`
  const number_of_days = days.value.length

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

// YouTube-Thumbnail
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
  /* Das Card-Element wird flexibel aufgeteilt */
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-card {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

/* Body-Teil, der scrollen darf */
.modal-body-scroller {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1rem;  /* card-body spacing */
}

/* Markierung, wenn ein Workout ausgewählt ist: blaue Umrandung */
.card.border-primary {
  border: 2px solid #0d6efd;
}

.nav-tabs .nav-link {
  cursor: pointer;
}
</style>
