<template>
    <div class="auto-plan-wizard-modal">
      <!-- Hintergrund: Klick -> emit close -->
      <div class="wizard-backdrop" @click="closeWizard"></div>
  
      <!-- Wizard-Inhalt -->
      <div class="wizard-container">
        <div class="card shadow-lg">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h4 class="mb-0">Automatischen Trainingsplan erstellen</h4>
            <button class="btn-close" @click="closeWizard"></button>
          </div>
  
          <div class="card-body">
            <!-- Schrittanzeige (1 bis 4) -->
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
  
            <!-- Schritt 1: Trainingsort + Geräte -->
            <div v-if="currentStep === 1">
              <h5>1. Wo möchtest du trainieren?</h5>
              <div class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="radio"
                  id="locHome"
                  value="home"
                  v-model="trainingLocation"
                />
                <label class="form-check-label" for="locHome">
                  Zuhause
                </label>
              </div>
              <div class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="radio"
                  id="locGym"
                  value="gym"
                  v-model="trainingLocation"
                />
                <label class="form-check-label" for="locGym">
                  Gym
                </label>
              </div>
  
              <!-- Geräte nur wenn Zuhause -->
              <div v-if="trainingLocation === 'home'" class="mt-3">
                <h6>Geräte (Checkboxes)</h6>
                <div
                  class="form-check"
                  v-for="(eq, idx) in allEquipmentOptions"
                  :key="idx"
                >
                  <input
                    type="checkbox"
                    class="form-check-input me-2"
                    :value="eq"
                    v-model="selectedEquipment"
                  />
                  <label class="form-check-label">
                    {{ eq }}
                  </label>
                </div>
              </div>
            </div>
  
            <!-- Schritt 2: Trainingsziel -->
            <div v-else-if="currentStep === 2">
              <h5>2. Was ist dein Trainingsziel?</h5>
              <select
                class="form-select"
                style="max-width: 300px;"
                v-model="trainingGoal"
              >
                <option value="">Bitte wählen</option>
                <option value="abnehmen">Abnehmen (Cardio/HIIT)</option>
                <option value="muskelaufbau">Muskelaufbau (Strength)</option>
                <option value="gesundheit">Allgemeine Fitness</option>
              </select>
            </div>
  
            <!-- Schritt 3: Anzahl Tage -->
            <div v-else-if="currentStep === 3">
              <h5>3. Wie oft pro Woche?</h5>
              <select
                class="form-select"
                style="max-width: 200px;"
                v-model.number="numberOfDays"
              >
                <option value="2">2 Tage</option>
                <option value="3">3 Tage</option>
                <option value="4">4 Tage</option>
                <option value="5">5 Tage</option>
              </select>
            </div>
  
            <!-- Schritt 4: Übersicht & Generierung -->
            <div v-else-if="currentStep === 4">
              <h5>4. Übersicht & Generieren</h5>
              <ul>
                <li><strong>Ort:</strong> {{ trainingLocationLabel }}</li>
                <li><strong>Ziel:</strong> {{ trainingGoal || '–' }}</li>
                <li><strong>Tage/Woche:</strong> {{ numberOfDays }}</li>
                <li v-if="trainingLocation === 'home'">
                  <strong>Geräte:</strong>
                  <template v-if="selectedEquipment.length > 0">
                    {{ selectedEquipment.join(', ') }}
                  </template>
                  <template v-else>keine</template>
                </li>
              </ul>
  
              <button class="btn btn-primary" @click="generatePlan">
                Plan generieren & speichern
              </button>
  
              <!-- Fehlermeldung bei der Plan-Erstellung -->
              <div
                v-if="planError"
                class="alert alert-warning mt-3"
              >
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
  
  // Beispiel: defineEmits
  const emit = defineEmits(['close', 'plan-created'])
  
  // Steps
  const currentStep = ref(1)
  const totalSteps = 4
  
  // Felder
  const trainingLocation = ref('home')   // "home" oder "gym"
  const trainingGoal = ref('')
  const numberOfDays = ref(3)
  const selectedEquipment = ref([])
  
  // Mögliche Geräte
  const allEquipmentOptions = [
    'Kurzhanteln',
    'Klimmzugstange',
    'Kettlebell',
    'Langhantel',
    'Gymnastikball',
    'Widerstandsband',
    'Hantelbank'
  ]
  
  // Problem-Muskeln => aus user_settings
  const userProblemMuscles = ref([])
  // Alle Workouts
  const allWorkouts = ref([])
  
  // Fehler
  const planError = ref('')
  
  // userID
  const userId = ref(null)
  
  // UI Helpers
  const trainingLocationLabel = computed(() => {
    return trainingLocation.value === 'gym'
      ? 'Gym (Fitnessstudio)'
      : 'Zuhause (Home Workout)'
  })
  
  // onMounted => user check + problemMuscles + workouts
  onMounted(async () => {
    try {
      // Auth check
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData?.user) {
        throw new Error('Nicht eingeloggt.')
      }
      userId.value = authData.user.id
  
      // user_settings => problem_muscle_groups
      const { data: userSettingsData, error: userSettingsError } = await supabase
        .from('user_settings')
        .select('problem_muscle_groups')
        .eq('user_id', userId.value)
        .single()
  
      if (!userSettingsError && userSettingsData) {
        userProblemMuscles.value = userSettingsData.problem_muscle_groups || []
      }
  
      // Workouts laden
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
      if (workoutsError) throw workoutsError
  
      allWorkouts.value = workoutsData || []
    } catch (err) {
      planError.value = err.message
    }
  })
  
  // Wizard controls
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
  
  // Generieren & Speichern
  async function generatePlan() {
    planError.value = ''
  
    if (!userId.value) {
      planError.value = 'Kein User im Wizard gefunden.'
      return
    }
  
    // 1) Filter Problemzonen
    let filtered = allWorkouts.value.filter((workout) => {
      const pm = workout.problem_muscle_groups || []
      const overlap = pm.some((m) => userProblemMuscles.value.includes(m))
      return !overlap
    })
  
    // 2) Wenn Zuhause => equipment
    if (trainingLocation.value === 'home') {
      const eqLower = selectedEquipment.value.map((e) => e.toLowerCase())
      filtered = filtered.filter((workout) => {
        // Angenommen das Feld heißt "equipment"
        const reqEq = workout.equipment || []
        return reqEq.every((req) => eqLower.includes(req.toLowerCase()))
      })
    }
  
    // 3) Trainingsziel
    if (trainingGoal.value) {
      filtered = filtered.filter((workout) => {
        const wType = (workout.type || '').toLowerCase()
        if (trainingGoal.value === 'abnehmen') {
          return wType.includes('cardio') || wType.includes('hiit')
        } else if (trainingGoal.value === 'muskelaufbau') {
          return wType.includes('strength') || wType.includes('hypertrophy')
        } else if (trainingGoal.value === 'gesundheit') {
          return true
        }
        return true
      })
    }
  
    if (filtered.length === 0) {
      planError.value = 'Keine passenden Workouts gefunden.'
      return
    }
  
    // 4) Zufalls-Auswahl: numberOfDays => pro Tag 3 Workouts (Beispiel)
    const workoutsPerDay = 3
    const planArr = []
    for (let i = 0; i < numberOfDays.value; i++) {
      planArr.push(getRandomWorkouts(filtered, workoutsPerDay))
    }
  
    // 5) Speichern
    try {
      const plan_data = {
        days: planArr.map((workouts, idx) => ({
          dayIndex: idx + 1,
          workouts: workouts.map((w) => w.id)
        }))
      }
      const plan_name = `Plan vom ${new Date().toLocaleDateString()}`
  
      const { data: inserted, error } = await supabase
        .from('training_plans')
        .insert({
          user_id: userId.value,
          plan_name,
          number_of_days: numberOfDays.value,
          plan_data
        })
        .select('*')
        .single()
  
      if (error) {
        planError.value = 'Fehler beim Speichern: ' + error.message
        return
      }
  
      // Erfolg => Emit an Parent
      emit('plan-created', inserted)
      // Schließen
      emit('close')
    } catch (err) {
      planError.value = 'Unerwarteter Fehler: ' + err.message
    }
  }
  
  // Hilfsfunktionen
  function getRandomWorkouts(list, n) {
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
    background-color: rgba(0,0,0,0.5);
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
  