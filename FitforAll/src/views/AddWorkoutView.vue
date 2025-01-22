<template>
  <div class="container mt-5" style="max-width: 800px;">
    <h2 class="mb-4">Neues Workout hinzufügen</h2>

    <form @submit.prevent="handleSubmit">
      <!-- Workout-Name -->
      <div class="mb-3">
        <label for="workoutName" class="form-label">Workout-Name</label>
        <input
          type="text"
          id="workoutName"
          class="form-control"
          v-model="workoutName"
          required
          aria-required="true"
        />
      </div>

      <!-- Beschreibung -->
      <div class="mb-3">
        <label for="workoutDescription" class="form-label">Beschreibung</label>
        <textarea
          id="workoutDescription"
          class="form-control"
          rows="3"
          v-model="workoutDescription"
          required
          aria-required="true"
        ></textarea>
      </div>

      <!-- YouTube-Link -->
      <div class="mb-3">
        <label for="youtubeUrl" class="form-label">YouTube-Video-Link</label>
        <input
          type="url"
          id="youtubeUrl"
          class="form-control"
          placeholder="https://www.youtube.com/watch?v=DEIN_VIDEO_ID"
          v-model="workoutVideoUrl"
          required
          aria-required="true"
        />
        <small class="text-muted">
          Unterstützt werden gängige Videoplattformen (YouTube, Vimeo etc.).
        </small>
      </div>

      <!-- ERSTER ABSCHNITT: Problem-Muskeln (werden in problem_muscle_groups gespeichert) -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-danger text-white">
          <h5 class="mb-0">Problem-Muskeln (ungeeignet)</h5>
        </div>
        <div class="card-body">
          <p class="text-muted">
            Klicke auf die Muskeln, die für dieses Workout
            <strong>nicht</strong> geeignet sind.
          </p>
          <div class="svg-container" v-html="svgContentProblems" @click="handleSvgClickProblems"></div>
        </div>
      </div>

      <!-- ZWEITER ABSCHNITT: Ziel-Muskeln (werden trainiert; in target_muscles) -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">Trainierte Muskeln</h5>
        </div>
        <div class="card-body">
          <p class="text-muted">
            Klicke auf die Muskeln, die durch dieses Workout
            <strong>trainiert</strong> werden sollen.
          </p>
          <div class="svg-container" v-html="svgContentTargets" @click="handleSvgClickTargets"></div>
        </div>
      </div>

      <!-- ABSENDEN-BUTTON -->
      <button type="submit" class="btn btn-primary w-100">
        Workout speichern
      </button>
    </form>

    <!-- Fehlermeldung -->
    <div class="alert alert-danger mt-3" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <!-- Erfolgsmeldung -->
    <div class="alert alert-success mt-3" v-if="successMessage">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'

// Formularfelder
const workoutName = ref('')
const workoutDescription = ref('')
const workoutVideoUrl = ref('')

// problemMuscles -> wird in "problem_muscle_groups" gespeichert
const problemMuscles = ref([])

// targetMuscles -> wird in "target_muscles" gespeichert (neue Spalte)
const targetMuscles = ref([])

// Statusnachrichten
const errorMessage = ref('')
const successMessage = ref('')

// SVGs (wir laden zweimal dieselbe Datei)
const svgContentProblems = ref('')
const svgContentTargets = ref('')

// ON MOUNT
onMounted(async () => {
  try {
    // 1) SVG-Datei für problem-Muscles laden
    const responseProblem = await fetch('/assets/Muscle_Map.svg')
    svgContentProblems.value = await responseProblem.text()

    // 2) SVG-Datei für target-Muscles laden
    const responseTarget = await fetch('/assets/Muscle_Map.svg')
    svgContentTargets.value = await responseTarget.text()
  } catch (err) {
    console.error('Fehler beim Laden der SVG:', err)
  }

  // Falls du initial was vorselektieren möchtest -> nextTick
  await nextTick()
})

// Klick-Handler #1: Problem-Muskeln
function handleSvgClickProblems(event) {
  const target = event.target
  if (target.classList.contains('s2')) {
    const partId = target.id
    if (problemMuscles.value.includes(partId)) {
      // Entfernen
      problemMuscles.value = problemMuscles.value.filter(m => m !== partId)
      target.classList.remove('active')
    } else {
      // Hinzufügen
      problemMuscles.value.push(partId)
      target.classList.add('active')
    }
  }
}

// Klick-Handler #2: Ziel-Muskeln
function handleSvgClickTargets(event) {
  const target = event.target
  if (target.classList.contains('s2')) {
    const partId = target.id
    if (targetMuscles.value.includes(partId)) {
      // Entfernen
      targetMuscles.value = targetMuscles.value.filter(m => m !== partId)
      target.classList.remove('active')
    } else {
      // Hinzufügen
      targetMuscles.value.push(partId)
      target.classList.add('active')
    }
  }
}

// SPEICHER-FUNKTION
async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!workoutName.value || !workoutDescription.value || !workoutVideoUrl.value) {
    errorMessage.value = 'Bitte fülle alle erforderlichen Felder aus.'
    return
  }

  const { error } = await supabase
    .from('workouts')
    .insert({
      name: workoutName.value,
      description: workoutDescription.value,
      video_url: workoutVideoUrl.value,
      // Bestehende Spalte (keine neue): problem_muscle_groups
      problem_muscle_groups: problemMuscles.value,
      // Neue Spalte: target_muscles
      target_muscles: targetMuscles.value,
    })

  if (error) {
    errorMessage.value = error.message
    return
  }

  successMessage.value = 'Workout erfolgreich gespeichert!'
  // Reset Felder
  workoutName.value = ''
  workoutDescription.value = ''
  workoutVideoUrl.value = ''
  problemMuscles.value = []
  targetMuscles.value = []
  // Option: Entactive die SVG-Pfade
  // ...
}
</script>

<style scoped>
.container {
  max-width: 800px;
}

/* Gleiche SVG-Styles wie gewohnt */
.svg-container {
  width: 100%;
  height: auto;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.s2 {
  fill: #cccccc;
  cursor: pointer;
  transition: fill 0.3s;
}
.s2:hover {
  fill: #007bff; /* Hover-Farbe */
}
.s2.active {
  fill: #dc3545;  /* Rot, wenn aktiv -> kannst du anpassen */
}
</style>
