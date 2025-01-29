<template>
  <div class="training-plan-detail container my-5" style="max-width: 900px;">
    <!-- Kopfzeile mit Planname + 3-Punkte-Menü -->
    <div class="d-flex justify-content-between align-items-start mb-3">
      <h1 class="mb-0">
        Trainingsplan: {{ plan.value.plan_name || 'Unbenannter Plan' }}
      </h1>

      <!-- Drei-Punkte-Menü (Plan-Aktionen) -->
      <div class="dropdown" @click.stop>
        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" @click="toggleDropdown">
          ⋮
        </button>
        <ul class="dropdown-menu dropdown-menu-end" :class="{ show: dropdownOpen }">
          <li>
            <button class="dropdown-item" @click="renamePlan">
              Umbenennen
            </button>
          </li>
          <li>
            <hr class="dropdown-divider" />
          </li>
          <li>
            <button class="dropdown-item text-danger" @click="deletePlan">
              Löschen
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Ladezustand / Fehler -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Daten werden geladen...</p>
    </div>
    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <div v-else>
      <!-- Plan-Infos -->
      <p>
        <strong>Anzahl Tage:</strong> {{ plan.value.number_of_days }}<br />
        <strong>Erstellt am:</strong> {{ formatDate(plan.value.created_at) }}
      </p>

      <!-- Tages-Übersicht -->
      <div v-if="plan.value.plan_data && plan.value.plan_data.days">
        <div class="day-card card mb-3" v-for="(dayObj, index) in plan.value.plan_data.days" :key="index">
          <div class="card-header bg-light">
            <!-- Falls dayName existiert, zeigen wir das an. Sonst "Tag X". -->
            <h5 class="mb-0">
              {{ dayObj.dayName ? dayObj.dayName : 'Tag ' + (index + 1) }}
            </h5>
          </div>
          <div class="card-body">
            <!-- Falls dieser Tag Workouts hat -->
            <div v-if="dayObj.workouts && dayObj.workouts.length > 0">
              <div class="row row-cols-1 row-cols-md-2 g-3">
                <div v-for="(workoutId, i) in dayObj.workouts" :key="i" class="col">
                  <!-- Check: Haben wir dieses Workout in workoutMap? -->
                  <div class="card h-100" v-if="workoutMap.value[workoutId]">
                    <!-- Thumbnail -->
                    <img :src="getYoutubeThumbnail(workoutMap.value[workoutId].video_url)" class="card-img-top"
                      alt="Workout Thumbnail" style="object-fit: cover; height: 150px;" />
                    <div class="card-body">
                      <h5 class="card-title mb-1">
                        {{ workoutMap.value[workoutId].name }}
                      </h5>

                      <!-- Beschreibung -->
                      <p class="card-text text-muted" v-if="workoutMap.value[workoutId].description">
                        {{ excerpt(workoutMap.value[workoutId].description, 80) }}
                      </p>

                      <!-- Equipment -->
                      <div v-if="
                        workoutMap.value[workoutId].equipment &&
                        workoutMap.value[workoutId].equipment.length > 0
                      ">
                        <span v-for="(eq, eqIdx) in workoutMap.value[workoutId].equipment" :key="eqIdx"
                          class="badge bg-info text-dark me-1">
                          {{ eq }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Workout nicht in Map gefunden -->
                  <div class="card h-100" v-else>
                    <div class="card-body">
                      <p class="text-muted">
                        Unbekanntes Workout (ID: {{ workoutId }})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <p class="text-muted">Keine Workouts an diesem Tag.</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="alert alert-info">
        Kein Tagesplan vorhanden.
      </div>

      <!-- Button: Zurück zur Übersicht -->
      <router-link to="/training-plans" class="btn btn-outline-primary mt-3">
        Zur Übersicht
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'

// Route param => planId
const route = useRoute()
const router = useRouter()
const planId = route.params.planId

// State
const loading = ref(true)
const errorMessage = ref('')
const plan = ref({})

// Dropdown
const dropdownOpen = ref(false)

// workoutId -> { name, description, video_url, equipment: [] }
const workoutMap = ref({})

// onMounted => hole Plan + Workouts
onMounted(async () => {
  try {
    // Plan-Datensatz
    const { data: planData, error: planError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError) throw planError
    if (!planData) throw new Error('Plan nicht gefunden.')

    plan.value = planData


    // Workouts (Felder: id, name, description, video_url, equipment)
    const { data: workoutsData, error: wError } = await supabase
      .from('workouts')
      .select('id, name, description, video_url, equipment')
    if (wError) throw wError

    // Aufbau der Map
    const map = {}
    workoutsData.forEach((w) => {
      map[w.id] = {
        name: w.name,
        description: w.description,
        video_url: w.video_url,
        equipment: w.equipment || []
      }
    })
    workoutMap.value = map
  } catch (err) {
    errorMessage.value = err.message
    console.error('Fehler beim Laden des Plans:', err)
  } finally {
    loading.value = false
  }
})

// Helpers

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
  } catch {
    return '/fallback-thumbnail.jpg'
  }
}

function excerpt(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

// Dropdown toggeln
function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

// Plan umbenennen
async function renamePlan() {
  dropdownOpen.value = false
  if (!plan.value?.id) return

  const newName = prompt('Neuen Plan-Namen eingeben:', plan.value.plan_name || '')
  if (!newName || !newName.trim()) return

  try {
    const { data, error } = await supabase
      .from('training_plans')
      .update({ plan_name: newName.trim() })
      .eq('id', plan.value.id)
      .select('*')
      .single()

    if (error) throw error
    plan.value = data
  } catch (err) {
    alert('Fehler beim Umbenennen: ' + err.message)
  }
}

// Plan löschen
async function deletePlan() {
  dropdownOpen.value = false
  if (!plan.value?.id) return

  const ok = confirm(`Plan "${plan.value.plan_name}" wirklich löschen?`)
  if (!ok) return

  try {
    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', plan.value.id)

    if (error) throw error

    // Nach dem Löschen zur Liste navigieren
    router.push('/training-plans')
  } catch (err) {
    alert('Fehler beim Löschen: ' + err.message)
  }
}
</script>

<style scoped>
.training-plan-detail {
  min-height: 70vh;
}

.day-card .card-header {
  background-color: #f8f9fa;
}

/* Einfaches Dropdown-Styling */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  display: none;
  min-width: 8rem;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.dropdown-menu.show {
  display: block;
}
</style>
