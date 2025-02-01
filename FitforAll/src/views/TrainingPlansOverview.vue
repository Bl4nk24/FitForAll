<template>
  <div class="training-plans-page container my-5">
    <!-- Kopfbereich -->
    <header class="page-header text-center mb-5">
      <h1 class="display-4 fw-bold">Deine Trainingspläne</h1>
      <p class="lead text-muted">Verwalte deine Trainingspläne einfach und effizient.</p>
    </header>

    <!-- Ladezustand / Fehler -->
    <div v-if="loading" class="d-flex flex-column align-items-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <small class="mt-2">Lade Daten...</small>
    </div>
    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Hauptinhalt -->
    <main v-else>
      <!-- Header mit Aktionen -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold mb-0">Meine Pläne</h3>
        <div>
          <button class="btn btn-primary me-2 btn-sm" @click="showAutoWizard = true">
            <i class="bi bi-lightning-fill"></i>
            <span class="d-none d-md-inline"> Automatisch erstellen</span>
          </button>
          <button class="btn btn-outline-primary btn-sm" @click="showManualModal = true">
            <i class="bi bi-pencil-square"></i>
            <span class="d-none d-md-inline"> Manuell erstellen</span>
          </button>
        </div>
      </div>

      <!-- Trainingsplan Cards im responsiven Grid -->
      <div v-if="plans.length > 0">
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-4" v-for="(plan, index) in plans" :key="plan.id">
            <div class="card card-modern h-100">
              <div class="card-body d-flex flex-column">
                <!-- Plan Header: Titel und Datum -->
                <div class="plan-header mb-3">
                  <h5 class="card-title fs-6 mb-1">{{ plan.plan_name || 'Unbenannter Plan' }}</h5>
                  <p class="card-subtitle text-muted small">{{ formatDate(plan.created_at) }}</p>
                </div>
                <!-- SVG-Bereich: Voll sichtbar in der oberen Hälfte der Card -->
                <div class="svg-section mb-3" v-if="svgContent">
                  <div v-html="getPlanSvg(plan)"></div>
                </div>
                <!-- Aktionsbuttons -->
                <div class="mt-auto">
                  <div class="btn-group w-100" role="group">
                    <router-link :to="`/training-plans/${plan.id}/start`" class="btn btn-success btn-sm">
                      Training starten
                    </router-link>
                    <router-link :to="`/training-plans/${plan.id}/detail`" class="btn btn-outline-secondary btn-sm">
                      Anzeigen
                    </router-link>
                    <div class="dropdown ms-auto" @click.stop>
                      <button class="btn btn-link p-0 btn-sm" @click="toggleDropdown(index)">
                        <i class="bi bi-three-dots-vertical fs-4"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end" :class="{ show: openDropdownIndex === index }">
                        <li>
                          <button class="dropdown-item" @click="renamePlan(plan, index)">
                            <i class="bi bi-pencil"></i> Umbenennen
                          </button>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                          <button class="dropdown-item text-danger" @click="deletePlan(plan, index)">
                            <i class="bi bi-trash"></i> Löschen
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div><!-- Ende Card-Body -->
            </div><!-- Ende Card -->
          </div>
        </div>
      </div>
      <div v-else class="alert alert-info">
        Du hast noch keine Trainingspläne erstellt.
      </div>
    </main>

    <!-- Auto-Wizard -->
    <AutoPlanWizard v-if="showAutoWizard" @close="showAutoWizard = false" @plan-created="onPlanCreated" />
    <!-- Manuelles Modal -->
    <ManualPlanModal v-if="showManualModal" @close="showManualModal = false" @plan-created="onPlanCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import AutoPlanWizard from '../components/AutoPlanWizard.vue'
import ManualPlanModal from '../components/ManualPlanModal.vue'

const loading = ref(true)
const errorMessage = ref('')
const plans = ref([])

// Dropdown-Steuerung und Wizard-States
const openDropdownIndex = ref(null)
const showAutoWizard = ref(false)
const showManualModal = ref(false)

// Basis-SVG (einmalig laden)
const svgContent = ref('')

onMounted(async () => {
  try {
    // 1. Authentifizierung
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Du bist nicht eingeloggt.')
    }
    // 2. Trainingspläne laden
    const { data: plansData, error: plansError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
    if (plansError) throw plansError
    plans.value = plansData || []
    
    // 3. Alle referenzierten Workout-IDs sammeln
    const allWorkoutIds = new Set()
    plans.value.forEach(plan => {
      const planData = plan.plan_data
      if (planData && planData.days) {
        planData.days.forEach(day => {
          if (Array.isArray(day.workouts)) {
            day.workouts.forEach(workoutId => allWorkoutIds.add(workoutId))
          }
        })
      }
    })
    const workoutIdsArray = Array.from(allWorkoutIds)
    
    // 4. Falls Workouts referenziert werden, diese einmalig laden
    if (workoutIdsArray.length > 0) {
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .in('id', workoutIdsArray)
      if (workoutsError) throw workoutsError
      
      const workoutMap = {}
      workoutsData.forEach(workout => {
        workoutMap[workout.id] = workout
      })
      
      // 5. Für jeden Plan: Muskelgruppen deduplizieren
      plans.value.forEach(plan => {
        const muscleSet = new Set()
        const planData = plan.plan_data
        if (planData && planData.days) {
          planData.days.forEach(day => {
            if (Array.isArray(day.workouts)) {
              day.workouts.forEach(workoutId => {
                const workout = workoutMap[workoutId]
                if (workout && Array.isArray(workout.target_muscles)) {
                  workout.target_muscles.forEach(muscle => muscleSet.add(muscle))
                }
              })
            }
          })
        }
        plan.muscleGroups = Array.from(muscleSet)
      })
    }
    
    // 6. Basis-SVG-Muskelkarte laden
    try {
      const response = await fetch("/assets/Muscle_Map.svg")
      svgContent.value = await response.text()
    } catch (svgError) {
      console.error("Fehler beim Laden der SVG:", svgError)
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = err.message || 'Fehler beim Laden der Pläne.'
  } finally {
    loading.value = false
  }
})

// Callback: neuer Plan erstellt
function onPlanCreated(newPlan) {
  plans.value.unshift(newPlan)
}

// Hilfsfunktion: Datum formatieren
function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleString() : ''
}

// Dropdown toggeln
function toggleDropdown(idx) {
  openDropdownIndex.value = openDropdownIndex.value === idx ? null : idx
}

// Plan umbenennen
async function renamePlan(plan, idx) {
  openDropdownIndex.value = null
  const newName = prompt('Neuen Namen eingeben:', plan.plan_name || '')
  if (!newName || newName.trim() === plan.plan_name) return
  
  try {
    const { data: updated, error } = await supabase
      .from('training_plans')
      .update({ plan_name: newName.trim() })
      .eq('id', plan.id)
      .select('*')
      .single()
    if (error) throw error
    plans.value[idx] = updated
  } catch (err) {
    alert('Fehler beim Umbenennen: ' + err.message)
  }
}

// Plan löschen
async function deletePlan(plan, idx) {
  openDropdownIndex.value = null
  const ok = confirm(`Möchtest du den Plan "${plan.plan_name}" wirklich löschen?`)
  if (!ok) return
  
  try {
    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', plan.id)
    if (error) throw error
    plans.value.splice(idx, 1)
  } catch (err) {
    alert('Fehler beim Löschen: ' + err.message)
  }
}

/**
 * getPlanSvg(plan):
 * Parst die Basis-SVG und fügt für alle in plan.muscleGroups enthaltenen Muskel-IDs die CSS-Klasse "active" hinzu.
 */
function getPlanSvg(plan) {
  if (!svgContent.value) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
  
  // Entferne vorhandene active-Klassen
  doc.querySelectorAll('.active').forEach(el => el.classList.remove('active'))
  
  if (plan.muscleGroups && plan.muscleGroups.length > 0) {
    plan.muscleGroups.forEach(muscle => {
      const muscleEl = doc.getElementById(muscle)
      if (muscleEl) {
        muscleEl.classList.add('active')
      }
    })
  }
  return doc.documentElement.outerHTML
}
</script>

<style scoped>
/* Allgemeines Seitenlayout */
.training-plans-page {
  min-height: 80vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  background-image: radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px);
  background-size: 40px 40px;
  border-radius: 0.75rem;
  font-family: 'Poppins', sans-serif;
}

/* Kopfbereich */
.page-header h1 {
  font-size: 2.5rem;
}
.page-header p {
  font-size: 1.2rem;
}

/* Kompakte, moderne Card-Optik */
.card-modern {
  border: none;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.card-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0,0,0,0.15);
}

/* Card Body */
.card-body {
  padding: 1.5rem;
}

/* Plan Header */
.plan-header {
  margin-bottom: 1rem;
}

/* SVG-Bereich: Wir entfernen Hintergründe, damit keine weißen Balken entstehen.
   Die SVG wird als Block-Element mit fester Höhe dargestellt. */
.svg-section {
  width: 100%;
  height: 200px; /* Erhöhe die Höhe, um die Grafik vollständig zu zeigen */
  margin-bottom: 1rem;
}
.svg-section svg {
  width: 100%;
  height: 100%;
  display: block;
  background: transparent;
}

/* Dropdown-Style */
.dropdown-menu {
  border: none;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

/* Buttons */
.btn {
  border-radius: 50px;
  text-transform: none;
}
.btn-group .btn {
  flex: 1;
}
.dropdown-menu li {
  cursor: pointer;
}

/* Basis-SVG-Muskelkarte */
.s2 {
  fill: #cccccc;
  transition: fill 0.3s ease;
}
.s2.active {
  fill: #ff0000;
}

/* Responsivität */
@media (max-width: 576px) {
  .training-plans-page {
    padding: 1rem;
  }
  .svg-section {
    height: 150px;
  }
}
</style>
