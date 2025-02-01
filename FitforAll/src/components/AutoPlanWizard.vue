<template>
  <div class="auto-plan-wizard-modal">
    <!-- Hintergrund: Klick schließt den Wizard -->
    <div class="wizard-backdrop" @click="closeWizard"></div>

    <!-- Wizard-Container -->
    <div class="wizard-container">
      <div class="card shadow-lg">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h4 class="mb-0">Automatischen Trainingsplan erstellen</h4>
          <button class="btn-close" @click="closeWizard"></button>
        </div>

        <div class="card-body">
          <!-- Schrittanzeige -->
          <div class="wizard-steps d-flex justify-content-center mb-4">
            <div
              v-for="stepNum in totalSteps"
              :key="stepNum"
              class="wizard-step"
              :class="{ 'active-step': stepNum === currentStep }"
            >
              {{ stepNum }}
            </div>
          </div>

          <!-- Schritt 1: Split auswählen -->
          <div v-if="currentStep === 1">
            <h5>1. Welchen Trainingssplit möchtest du verwenden?</h5>
            <div
              v-for="option in splitOptions"
              :key="option.value"
              class="form-check mb-2"
            >
              <input
                type="radio"
                :id="option.value"
                class="form-check-input"
                :value="option.value"
                v-model="selectedSplit"
              />
              <label class="form-check-label" :for="option.value">
                {{ option.label }}
              </label>
            </div>
          </div>

          <!-- Schritt 2: Trainingsdauer festlegen -->
          <div v-else-if="currentStep === 2">
            <h5>2. Wie lange soll deine Trainingseinheit dauern?</h5>
            <p class="text-muted">Hinweis: Jede Übung dauert ca. 10 Minuten.</p>
            <div class="mb-3" style="max-width: 200px;">
              <input
                type="number"
                class="form-control"
                v-model.number="sessionDuration"
                min="10"
                step="10"
              /> Minuten
            </div>
          </div>

          <!-- Schritt 3: Übersicht -->
          <div v-else-if="currentStep === 3">
            <h5>3. Übersicht</h5>
            <ul>
              <li>
                <strong>Split:</strong>
                {{ selectedSplitLabel }}
              </li>
              <li>
                <strong>Anzahl Workouts:</strong>
                {{ splitDays }} (werden automatisch erstellt)
              </li>
              <li>
                <strong>Dauer pro Einheit:</strong>
                {{ sessionDuration }} Minuten
                <span v-if="exercisesPerWorkout > 0">
                  (ca. {{ exercisesPerWorkout }} Übung(en))
                </span>
              </li>
              <li>
                <strong>Planname Basis:</strong>
                {{ autoPlanNameBase }}
              </li>
            </ul>
            <button class="btn btn-primary" @click="generatePlan">
              Plan generieren & speichern
            </button>
            <div v-if="planError" class="alert alert-warning mt-3">
              {{ planError }}
            </div>
          </div>
        </div>

        <!-- Footer: Navigation -->
        <div class="card-footer d-flex justify-content-between bg-light">
          <button
            class="btn btn-outline-secondary"
            :disabled="currentStep === 1"
            @click="prevStep"
          >
            Zurück
          </button>
          <button
            class="btn btn-primary"
            v-if="currentStep < totalSteps"
            @click="nextStep"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

const emit = defineEmits(['close', 'plan-created'])

// --- Wizard-Steps ---
const currentStep = ref(1)
const totalSteps = 3

// --- Split-Optionen ---
// Hinweis: Upper/Lower erzeugt 2 Workouts, Full Body und Push/Pull/Legs jeweils 3.
const splitOptions = [
  { value: 'full_body', label: 'Full Body (3 Workouts)' },
  { value: 'upper_lower', label: 'Upper/Lower (2 Workouts)' },
  { value: 'push_pull_legs', label: 'Push/Pull/Legs (3 Workouts)' }
]
const selectedSplit = ref(splitOptions[0].value)

// --- Trainingsdauer (in Minuten) ---
const sessionDuration = ref(30) // Default: 30 Minuten

// --- Fehleranzeige ---
const planError = ref('')

// --- User & Übungen laden ---
const userId = ref(null)
const allWorkouts = ref([])

onMounted(async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Nicht eingeloggt.')
    }
    userId.value = authData.user.id

    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
    if (workoutsError) throw workoutsError

    allWorkouts.value = workoutsData || []
  } catch (err) {
    planError.value = err.message
  }
})

// --- Berechnete Werte ---
const splitDays = computed(() => {
  if (selectedSplit.value === 'full_body') return 3
  if (selectedSplit.value === 'upper_lower') return 2  // Upper/Lower → 2 Workouts
  if (selectedSplit.value === 'push_pull_legs') return 3
  return 3
})

const exercisesPerWorkout = computed(() => {
  // Jede Übung dauert ca. 10 Minuten
  return Math.floor(sessionDuration.value / 10)
})

const selectedSplitLabel = computed(() => {
  const option = splitOptions.find(opt => opt.value === selectedSplit.value)
  return option ? option.label : ''
})

// Basis des Plannamens (z. B. "Full" oder "Upper/Lower" plus Datum)
const autoPlanNameBase = computed(() => {
  const dateStr = new Date().toLocaleDateString()
  // Für Upper/Lower wollen wir später unterschiedliche Namen (Push/Pull) vergeben.
  if (selectedSplit.value === 'upper_lower') {
    // Rückgabe wird im Loop individuell gesetzt
    return dateStr
  }
  const base = selectedSplitLabel.value.split(' ')[0]
  return `${base} - ${dateStr}`
})

// --- Wizard-Navigation ---
function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function closeWizard() {
  emit('close')
}

// --- Plan generieren & speichern ---
// Für jeden Workout-Tag wird ein separater Eintrag in der Tabelle training_plans erstellt.
// Die JSON-Struktur enthält genau einen Tag mit einem Array von Übungs-IDs.
async function generatePlan() {
  planError.value = ''

  if (!userId.value) {
    planError.value = 'Kein User gefunden.'
    return
  }

  if (!allWorkouts.value.length) {
    planError.value = 'Keine Übungen verfügbar.'
    return
  }

  const workoutsToInsert = []
  const dateStr = new Date().toLocaleDateString()

  // Für jeden Trainingstag (entsprechend dem Split) wird ein Workout erstellt.
  for (let i = 0; i < splitDays.value; i++) {
    const exerciseList = getRandomExercises(allWorkouts.value, exercisesPerWorkout.value)
    let workoutName = ''

    if (selectedSplit.value === 'upper_lower') {
      // Für Upper/Lower: Tag 1 = Push, Tag 2 = Pull
      workoutName = i === 0 ? `Upper - ${dateStr}` : `Lower - ${dateStr}`
    } else {
      // Standard: Basisname + " - Tag X"
      workoutName = `${autoPlanNameBase.value} - Tag ${i + 1}`
    }

    const planData = {
      days: [
        {
          dayName: i === 0 && selectedSplit.value === 'upper_lower' ? 'Push' : 
                    i === 1 && selectedSplit.value === 'upper_lower' ? 'Pull' : `Tag ${i + 1}`,
          workouts: exerciseList.map(ex => ex.id)
        }
      ]
    }

    workoutsToInsert.push({
      user_id: userId.value,
      plan_name: workoutName,
      number_of_days: 1, // Jedes Workout hat nur einen Tag
      plan_data: planData
    })
  }

  try {
    // Mehrere Einträge gleichzeitig einfügen
    const { data: inserted, error } = await supabase
      .from('training_plans')
      .insert(workoutsToInsert)
      .select('*')
    if (error) {
      planError.value = 'Fehler beim Speichern: ' + error.message
      return
    }
    emit('plan-created', inserted)
    emit('close')
    // Seite neu laden
    window.location.reload()
  } catch (err) {
    planError.value = 'Unerwarteter Fehler: ' + err.message
  }
}

// Hilfsfunktion: Liefert n zufällige Übungen aus der Liste
function getRandomExercises(list, n) {
  const shuffled = [...list].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, n)
}
</script>

<style scoped>
.auto-plan-wizard-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wizard-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.wizard-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: auto;
}

/* Wizard Steps */
.wizard-steps {
  margin-bottom: 1rem;
}
.wizard-step {
  width: 40px;
  height: 40px;
  margin: 0 6px;
  border-radius: 50%;
  background-color: #ddd;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.wizard-step.active-step {
  background-color: #007bff;
  color: #fff;
}
</style>
