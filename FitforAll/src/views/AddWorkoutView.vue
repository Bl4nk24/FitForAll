<template>
    <div class="container mt-5">
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
            Unterstützt werden gängige Videoplattformen wie YouTube, Vimeo etc.
          </small>
        </div>
  
        <!-- Einschränkungen (Check-Boxen), für die das Workout NICHT geeignet ist -->
        <div class="mb-3">
          <label class="form-label fw-bold"
            >Nicht geeignet für folgende Einschränkungen (optional)</label
          >
          <div
            class="form-check"
            v-for="(opt, index) in limitationOptions"
            :key="index"
          >
            <input
              class="form-check-input"
              type="checkbox"
              :id="opt.value"
              :value="opt.value"
              v-model="limitations"
            />
            <label class="form-check-label" :for="opt.value">
              {{ opt.label }}
            </label>
          </div>
        </div>
  
        <!-- Button -->
        <button type="submit" class="btn btn-success w-100">
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
  import { ref } from 'vue'
  import { supabase } from '../supabase'
  
  // Formularfelder
  const workoutName = ref('')
  const workoutDescription = ref('')
  const workoutVideoUrl = ref('')
  const limitations = ref([]) // text[] (wenn du das so in deiner Tabelle speicherst)
  
  // Checkbox-Optionen
  const limitationOptions = [
    { value: 'rollstuhl', label: 'Rollstuhl' },
    { value: 'sehbehinderung', label: 'Sehbehinderung' },
    { value: 'hörbehinderung', label: 'Hörbehinderung' },
    { value: 'prothese', label: 'Prothese/Amputation' },
    { value: 'chronische_schmerzen', label: 'Chronische Schmerzen' },
    // Weitere nach Bedarf
  ]
  
  const errorMessage = ref('')
  const successMessage = ref('')
  
  async function handleSubmit() {
    errorMessage.value = ''
    successMessage.value = ''
  
    // Validierung (falls nötig, hier nur Basis-Check)
    if (!workoutName.value || !workoutDescription.value || !workoutVideoUrl.value) {
      errorMessage.value = 'Bitte fülle alle erforderlichen Felder aus.'
      return
    }
  
    // Insert in die "workouts"-Tabelle (passe den Tabellennamen an)
    const { error } = await supabase
      .from('workouts')
      .insert({
        name: workoutName.value,
        description: workoutDescription.value,
        video_url: workoutVideoUrl.value,
        limitations: limitations.value, // Array mit Werten wie ["rollstuhl", "sehbehinderung", ...]
      })
  
    if (error) {
      errorMessage.value = error.message
    } else {
      // Bei Erfolg Felder leeren und Erfolgsmeldung
      successMessage.value = 'Workout erfolgreich gespeichert!'
      workoutName.value = ''
      workoutDescription.value = ''
      workoutVideoUrl.value = ''
      limitations.value = []
    }
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
  }
  </style>
  