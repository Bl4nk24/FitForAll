<template>
  <!-- Äußerer Wrapper: Hier wird der Hintergrund flächenfüllend angezeigt -->
  <div class="training-plans-page my-5">
    <!-- Innerer Container für den Inhalt – bleibt transparent -->
    <div class="container">
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
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-4" v-for="(plan, index) in plans" :key="plan.id">
            <div class="card card-modern h-100">
              <div class="card-body d-flex flex-column">
                <div class="plan-header mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="card-title fs-6 mb-1">{{ plan.plan_name || 'Unbenannter Plan' }}</h5>
                    <!-- Beschreibung/Datum -->
                    <p class="card-subtitle text-muted small">
                      {{ formatDate(plan.created_at) }}
                    </p>
                  </div>
                  <div class="plan-actions">
                    <button class="btn btn-link p-0 rename-btn" @click="renamePlan(plan, index)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link p-0 delete-btn" @click="deletePlan(plan, index)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="svg-section mb-3" v-if="svgContent">
                  <div v-html="getPlanSvg(plan)"></div>
                </div>
                <div class="mt-auto">
                  <div class="btn-group w-100" role="group">
                    <router-link :to="`/training-plans/${plan.id}/start`" class="btn btn-success btn-sm">
                      Training starten
                    </router-link>
                    <!-- "Anzeigen"-Button (Hover wird unten in CSS geregelt) -->
                    <router-link :to="`/training-plans/${plan.id}/detail`" class="btn btn-outline-secondary btn-sm">
                      Anzeigen
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  
    <!-- Modale für Plan-Erstellung -->
    <AutoPlanWizard
      v-if="showAutoWizard"
      @close="showAutoWizard = false"
      @plan-created="onPlanCreated"
    />
    <ManualPlanModal
      v-if="showManualModal"
      @close="showManualModal = false"
      @plan-created="onPlanCreated"
    />
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

const showAutoWizard = ref(false)
const showManualModal = ref(false)
const svgContent = ref('')

onMounted(async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Du bist nicht eingeloggt.')
    }
    const { data: plansData, error: plansError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
    if (plansError) throw plansError
    plans.value = plansData || []
    
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

function onPlanCreated(newPlan) {
  plans.value.unshift(newPlan)
}

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleString() : ''
}

async function renamePlan(plan, idx) {
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

async function deletePlan(plan, idx) {
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

function getPlanSvg(plan) {
  if (!svgContent.value) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
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
.training-plans-page {
  min-height: 80vh;
  padding: 2rem;
  /* Im Normalmodus: Verlauf mit weißen Punkten */
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  background-image: radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px);
  background-size: 40px 40px;
  border-radius: 0.75rem;
  font-family: 'Poppins', sans-serif;
}

/* Der innere Container bleibt transparent */
.training-plans-page .container {
  background: transparent !important;
}

/* Kopfbereich */
.page-header h1 {
  font-size: 2.5rem;
}
.page-header p {
  font-size: 1.2rem;
}

/* Card Styles */
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

.card-body {
  padding: 1.5rem;
}

.plan-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.plan-header h5 {
  margin: 0;
}
.plan-actions button {
  margin-left: 0.5rem;
  color: #6c757d;
}

.svg-section {
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
}
.svg-section svg {
  width: 100%;
  height: 100%;
  display: block;
  background: transparent;
}

.btn {
  border-radius: 50px;
  text-transform: none;
}
.btn-group .btn {
  flex: 1;
}

.s2 {
  fill: #cccccc;
  transition: fill 0.3s ease;
}
.s2.active {
  fill: #ff0000;
}

/* ========== Deine bisherigen Anpassungen ========== */

/* 1) Hover-Effekt für den "Anzeigen"-Button grün mit weißer Schrift */
.btn-outline-secondary.btn-sm:hover {
  background-color: #28a745 !important;
  color: #ffffff !important;
  border-color: #28a745 !important;
}

/* ================================== */
/* =   THEME-SPEZIFISCHE FARBSCHEN  = */
/* ================================== */

/* Theme NORMAL: Text schwarz */
:global(.theme-normal) .page-header p.lead.text-muted,
:global(.theme-normal) .card-subtitle {
  color: #000 !important;
}

/* Theme DARK & HIGH-CONTRAST: Text weiß */
:global(.theme-dark) .page-header p.lead.text-muted,
:global(.theme-dark) .card-subtitle,
:global(.theme-high-contrast) .page-header p.lead.text-muted,
:global(.theme-high-contrast) .card-subtitle {
  color: #fff !important;
}

@media (max-width: 576px) {
  .training-plans-page {
    padding: 1rem;
  }
  .svg-section {
    height: 150px;
  }
}

/* Override für Dunkles Design & Hoher Kontrast:
   Mit :global() überschreiben wir den lokalen Hintergrund (Verlauf mit weißen Punkten)
   und setzen ihn auf den vom Theme vorgegebenen Farbton. */
:global(.theme-dark) .training-plans-page {
  background: #121212 !important;
  background-image: none !important;
  background-size: auto !important;
}

:global(.theme-high-contrast) .training-plans-page {
  background: #000000 !important;
  background-image: none !important;
  background-size: auto !important;
}

/* Entfernen des Hintergrunds für alle Kinder-Elemente */
* {
  background: none !important;
  background-image: none !important;
}
</style>
