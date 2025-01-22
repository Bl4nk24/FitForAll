<template>
    <div class="container my-5" style="max-width: 900px;">
      <!-- Ladezustand / Fehler -->
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Workout wird geladen...</p>
      </div>
  
      <div v-else-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
  
      <!-- Workout-Detail -->
      <div v-else-if="workout">
        <h2 class="mb-3">{{ workout.name }}</h2>
  
        <!-- VIDEO -->
        <div class="ratio ratio-16x9 mb-3" v-if="isYoutube(workout.video_url)">
          <iframe
            :src="getEmbeddedUrl(workout.video_url)"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
        <div v-else class="mb-4">
          <strong>Video-Link:</strong>
          <a :href="workout.video_url" target="_blank">
            {{ workout.video_url }}
          </a>
        </div>
  
        <!-- BESCHREIBUNG -->
        <p class="mb-4">{{ workout.description }}</p>
  
        <!-- SVG -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="mb-0">Trainierte Muskeln</h5>
          </div>
          <div class="card-body">
            <p class="text-muted">
              Markierte Muskeln (z.B. in Rot) sind laut Workout festgelegt.
            </p>
            <div class="svg-container" v-html="svgContent"></div>
          </div>
        </div>
  
        <!-- Neues Training anlegen -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="mb-0">Neues Training</h5>
          </div>
          <div class="card-body">
            <!-- Notiz -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Notiz zum Training</label>
              <textarea
                class="form-control"
                rows="2"
                v-model="trainingNote"
                placeholder="z.B. Allgemeines Befinden, Ziel, etc."
              ></textarea>
            </div>
  
            <hr />
            <h6>Sätze hinzufügen:</h6>
            <p class="text-muted" v-if="copiedFromLast">
              <em>Diese Sätze wurden aus deinem letzten Training übernommen.</em>
            </p>
  
            <!-- Sätze-Liste -->
            <div
              class="row g-2 align-items-end"
              v-for="(item, index) in trainingSets"
              :key="index"
            >
              <div class="col-4">
                <label class="form-label">Reps</label>
                <input
                  type="number"
                  min="1"
                  class="form-control"
                  v-model.number="item.reps"
                  placeholder="z.B. 10"
                />
              </div>
              <div class="col-4">
                <label class="form-label">Gewicht (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  class="form-control"
                  v-model.number="item.weight"
                  placeholder="z.B. 40"
                />
              </div>
              <div class="col-4">
                <button
                  class="btn btn-danger"
                  @click="removeSet(index)"
                >
                  Entfernen
                </button>
              </div>
            </div>
  
            <!-- Buttons -->
            <div class="mt-3">
              <button class="btn btn-outline-success" @click="addSet">
                Weiteren Satz hinzufügen
              </button>
              <button class="btn btn-primary ms-3" @click="saveTraining">
                Training speichern
              </button>
            </div>
  
          </div>
        </div>
  
        <!-- Erfolgsmeldung -->
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>
      </div>
  
      <!-- Kein Workout -->
      <div v-else class="alert alert-warning">
        Kein Workout mit dieser ID gefunden.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue'
  import { useRoute } from 'vue-router'
  import { supabase } from '../supabase'
  
  const route = useRoute()
  const workoutId = route.params.id
  
  // States
  const loading = ref(true)
  const errorMessage = ref('')
  const successMessage = ref('')
  
  // Workout + SVG
  const workout = ref(null)
  const svgContent = ref('')
  
  // Training
  const trainingNote = ref('')       // Neue Notiz
  const trainingSets = ref([])       // { reps, weight }
  const copiedFromLast = ref(false)  // Flag, ob wir die Sätze aus dem letzten Training kopiert haben
  
  onMounted(async () => {
    try {
      loading.value = true
  
      // 1) Auth
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        errorMessage.value = 'Du bist nicht eingeloggt.'
        loading.value = false
        return
      }
      const userId = userData.user.id
  
      // 2) Workout laden
      const { data: workoutData, error: wError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single()
      if (wError) throw wError
      if (!workoutData) {
        // kein Workout gefunden
        loading.value = false
        return
      }
      workout.value = workoutData
  
      // 3) SVG laden
      const resp = await fetch('/assets/Muscle_Map.svg')
      svgContent.value = await resp.text()
  
      // 4) Muskeln highlighten
      await nextTick()
      highlightMuscles(workout.value.target_muscles || [])
  
      // 5) Letztes Training holen und Sätze übernehmen
      await loadLastTraining(userId)
  
    } catch (err) {
      console.error('Fehler:', err)
      errorMessage.value = 'Fehler beim Laden des Workouts.'
    } finally {
      loading.value = false
    }
  })
  
  /**
   * Holt die letzte Training Session + die zugehörigen Sätze,
   * setzt sie in das Formular (trainingSets).
   * Notiz bleibt leer.
   */
  async function loadLastTraining(userId) {
    try {
      // Letzte Session aus "training_sessions"
      // Sortiere nach created_at DESC, nimm das oberste
      const { data: lastSessionData, error: lastSessionError } = await supabase
        .from('training_sessions')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: false })
        .limit(1)
  
      if (lastSessionError) throw lastSessionError
      if (!lastSessionData || lastSessionData.length === 0) {
        // Kein früheres Training vorhanden
        return
      }
  
      const lastSession = lastSessionData[0]
      // Sätze holen
      const { data: setsData, error: setsError } = await supabase
        .from('training_session_sets')
        .select('reps, weight')
        .eq('training_session_id', lastSession.id)
  
      if (setsError) throw setsError
      if (!setsData || setsData.length === 0) {
        return
      }
  
      // Sätze ins Formular übernehmen
      trainingSets.value = setsData.map(s => ({
        reps: s.reps,
        weight: s.weight
      }))
  
      copiedFromLast.value = true
    } catch (err) {
      console.error('Fehler beim Laden des letzten Trainings:', err)
      // Keine harte Fehlermeldung anzeigen, 
      // wir brechen den Prozess hier nur ab.
    }
  }
  
  /**
   * SVG-Highlight
   */
  function highlightMuscles(muscleList) {
    muscleList.forEach(muscleId => {
      const el = document.getElementById(muscleId)
      if (el) {
        el.classList.add('highlight')
      }
    })
  }
  
  /**
   * Sätze-Logik
   */
  function addSet() {
    trainingSets.value.push({ reps: null, weight: null })
  }
  function removeSet(index) {
    trainingSets.value.splice(index, 1)
  }
  
  /**
   * Neues Training speichern
   * => Erstellen einer training_sessions-Zeile + sets
   */
  async function saveTraining() {
    errorMessage.value = ''
    successMessage.value = ''
  
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      errorMessage.value = 'Nicht eingeloggt.'
      return
    }
    const userId = userData.user.id
  
    // 1) Neue Session
    let newSessionId = null
    try {
      const { data: insertSessionData, error: insertSessionError } = await supabase
        .from('training_sessions')
        .insert({
          user_id: userId,
          workout_id: workoutId,
          note: trainingNote.value, // Notiz ist hier leer oder vom Benutzer neu geschrieben
        })
        .select('*') // wir wollen ID zurück
        .single()
  
      if (insertSessionError) throw insertSessionError
      newSessionId = insertSessionData.id
    } catch (err) {
      console.error('Fehler beim Erstellen einer Training Session:', err)
      errorMessage.value = 'Fehler beim Erstellen des Trainings.'
      return
    }
  
    // 2) Sätze
    if (trainingSets.value.length > 0) {
      const setInserts = trainingSets.value.map(s => ({
        training_session_id: newSessionId,
        reps: s.reps || 0,
        weight: s.weight || 0,
      }))
  
      try {
        const { error: insertSetsError } = await supabase
          .from('training_session_sets')
          .insert(setInserts)
  
        if (insertSetsError) throw insertSetsError
      } catch (err) {
        console.error('Fehler beim Einfügen der Sätze:', err)
        errorMessage.value = 'Training wurde angelegt, aber Fehler bei den Sätzen.'
        return
      }
    }
  
    // Erfolg
    successMessage.value = 'Training erfolgreich gespeichert!'
    trainingNote.value = ''
    trainingSets.value = []
    copiedFromLast.value = false
  }
  
  // Hilfsfunktionen Video
  function isYoutube(url) {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be')
  }
  function getEmbeddedUrl(url) {
    const match1 = url.match(/[?&]v=([^&]+)/)
    if (match1 && match1[1]) {
      return `https://www.youtube.com/embed/${match1[1]}`
    }
    const match2 = url.match(/youtu\.be\/([^?]+)/)
    if (match2 && match2[1]) {
      return `https://www.youtube.com/embed/${match2[1]}`
    }
    return url
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 900px;
  }
  
  .svg-container {
    width: 100%;
    height: auto;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin-top: 1rem;
    background-color: #f8f9fa;
    padding: 1rem;
  }
  .highlight {
    fill: #dc3545; /* rot */
    transition: fill 0.3s;
  }
  </style>
  