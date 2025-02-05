<template>
    <div class="app-wrapper">
      <!-- Main Content Layout -->
      <div class="main-layout">
        <!-- Left Column -->
        <div class="content-column">
          <!-- Video Section -->
          <div v-if="!loading && !errorMessage && workout && isYoutube(workout.video_url)" class="video-section">
            <div class="video-wrapper">
              <iframe
                :src="getEmbeddedUrl(workout.video_url)"
                class="video-iframe"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
          </div>
  
          <!-- Workout Details (Titel & Beschreibung) -->
          <div v-if="workout" class="details-section">
            <div class="details-card">
              <h1 class="workout-title">{{ workout.name }}</h1>
              <div v-if="!isYoutube(workout.video_url)" class="external-video-link">
                <a :href="workout.video_url" target="_blank">
                  <i class="bi bi-link-45deg"></i> Video ansehen
                </a>
              </div>
              <p class="workout-description">{{ workout.description }}</p>
            </div>
          </div>
  
          <!-- Loading/Error States -->
          <div v-if="loading" class="state-overlay">
            <div class="spinner-border text-primary"></div>
            <p>Workout wird geladen...</p>
          </div>
          <div v-if="errorMessage" class="state-overlay error">
            {{ errorMessage }}
          </div>
        </div>
  
        <!-- Right Column -->
        <div class="sidebar-column">
          <!-- Muscle Map Card -->
          <div v-if="workout" class="sidebar-card muscle-card">
            <h3 class="card-title">
              <i class="bi bi-heart-pulse"></i> Beanspruchte Muskeln
            </h3>
            <div class="svg-container" v-html="svgContent"></div>
          </div>
  
          <!-- Training Log Form -->
          <div v-if="workout" class="sidebar-card training-form">
            <h3 class="card-title">
              <i class="bi bi-clipboard-plus"></i> Neues Training
            </h3>
  
            <div v-if="successMessage" class="success-message">
              <i class="bi bi-check-circle"></i> {{ successMessage }}
            </div>
  
            <div class="form-group">
              <label>Notiz</label>
              <textarea
                v-model="trainingNote"
                class="note-input"
                placeholder="Wie fühlst du dich heute?..."
              ></textarea>
            </div>
  
            <div class="sets-header">
              <h4>Sätze</h4>
              <button @click="addSet" class="icon-button">
                <i class="bi bi-plus-circle"></i>
              </button>
            </div>
  
            <div class="sets-list">
              <div v-for="(item, index) in trainingSets" :key="index" class="set-item">
                <div class="set-number">#{{ index + 1 }}</div>
                <input type="number" v-model.number="item.reps" class="set-input" placeholder="Wdh." />
                <input type="number" v-model.number="item.weight" class="set-input" placeholder="kg" />
                <button @click="removeSet(index)" class="icon-button danger">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
  
            <button @click="saveTraining" class="save-button" :disabled="trainingSets.length === 0">
              <i class="bi bi-save"></i> Training speichern
            </button>
          </div>
  
          <!-- Calendar Section -->
          <div v-if="workout" class="sidebar-card calendar-section">
            <h3 class="card-title calendar-header">
              <button class="icon-button" @click="goToPreviousMonth">
                <i class="bi bi-arrow-left-circle"></i>
              </button>
              <span class="calendar-header-text">{{ monthName }} {{ year }}</span>
              <button class="icon-button" @click="goToNextMonth">
                <i class="bi bi-arrow-right-circle"></i>
              </button>
            </h3>
  
            <div class="calendar-grid">
              <!-- Kalender-Zeilen -->
              <div v-for="(row, rowIndex) in calendarRows" :key="rowIndex" class="calendar-row">
                <!-- Tage in der Zeile -->
                <div
                  v-for="(dayObj, dayIndex) in row"
                  :key="dayIndex"
                  :class="['calendar-day', { 'current-month': dayObj.isCurrentMonth }, { 'has-training': dayObj.hasTraining }]"
                  @click="dayClicked(dayObj)"
                >
                  {{ dayObj.dayNum }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Training Details Modal -->
      <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Training am {{ selectedDayLabel }}</h2>
            <button @click="closeModal" class="close-button">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <!-- Durchlauf der Training-Sessions -->
            <div v-for="(training, tIndex) in dayTrainings" :key="training.id" class="training-details">
              <p><strong>Datum:</strong> {{ formatDate(training.created_at) }}</p>
              <p><strong>Notiz:</strong> {{ training.note || 'Keine Notiz vorhanden' }}</p>
  
              <div v-if="training.sets && training.sets.length > 0">
                <h5>Sätze</h5>
                <ul>
                  <li v-for="(set, sIndex) in training.sets" :key="sIndex">
                    Satz {{ sIndex + 1 }}: {{ set.reps }} Wdh. x {{ set.weight }} kg
                  </li>
                </ul>
              </div>
  
              <!-- Trennlinie zwischen mehreren Sessions -->
              <hr v-if="tIndex < dayTrainings.length - 1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { supabase } from '../supabase'
  
  const route = useRoute()
  const workoutId = route.params.id
  
  // Loading & Errors
  const loading = ref(true)
  const errorMessage = ref('')
  const successMessage = ref('')
  
  // Workout-Daten und zugehörige Variablen
  const workout = ref(null)
  const targetMuscles = ref([])
  const svgContent = ref("")
  
  // Neues Training
  const trainingNote = ref('')
  const trainingSets = ref([])
  const copiedFromLast = ref(false)
  
  // Kalender und Modal
  const showModal = ref(false)
  const selectedDayLabel = ref('')
  const dayTrainings = ref([])
  
  // Kalender-Daten (Monat, Jahr etc.)
  const year = ref(new Date().getFullYear())
  const month = ref(new Date().getMonth())
  const trainingsByDate = ref({})
  const calendarRows = ref([])
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]
  const monthName = computed(() => monthNames[month.value] || '')
  
  onMounted(async () => {
    try {
      // SVG laden
      const response = await fetch("/assets/Muscle_Map.svg")
      svgContent.value = await response.text()
    } catch (error) {
      console.error("Fehler beim Laden der SVG:", error)
    }
  
    try {
      // Workout-Daten laden
      const { data: wData } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single()
  
      workout.value = wData || null
      targetMuscles.value = wData?.target_muscles || []
  
      // Aktivieren der SVG-Elemente (Muskel-Hervorhebung)
      setTimeout(() => {
        const svgEl = document.querySelector('.svg-container')
        if (svgEl) {
          targetMuscles.value.forEach((muscleId) => {
            const el = svgEl.querySelector(`#${muscleId}`)
            if (el) el.classList.add("active")
          })
        }
      }, 1500)
  
      // Trainings-Sessions laden
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: true })
  
      if (sessionsError) throw sessionsError
  
      let allSets = []
      if (sessionsData && sessionsData.length > 0) {
        const sessionIds = sessionsData.map(s => s.id)
        const { data: setsData, error: setsError } = await supabase
          .from('training_session_sets')
          .select('*')
          .in('training_session_id', sessionIds)
  
        if (setsError) throw setsError
        allSets = setsData || []
      }
  
      // Gruppierung der Sessions nach Datum
      sessionsData?.forEach(session => {
        const dayKey = formatDayKey(session.created_at)
        session.sets = allSets.filter(s => s.training_session_id === session.id)
        if (!trainingsByDate.value[dayKey]) {
          trainingsByDate.value[dayKey] = []
        }
        trainingsByDate.value[dayKey].push(session)
      })
  
      generateCalendar(year.value, month.value)
      await loadLastTraining()
    } catch (err) {
      console.error('Fehler beim Laden:', err)
      errorMessage.value = 'Fehler beim Laden der Daten.'
    } finally {
      loading.value = false
    }
  })
  
  async function loadLastTraining() {
    try {
      const { data: lastSessionData } = await supabase
        .from('training_sessions')
        .select('id, created_at')
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: false })
        .limit(1)
  
      if (!lastSessionData || lastSessionData.length === 0) return
      const lastSession = lastSessionData[0]
  
      const { data: setsData } = await supabase
        .from('training_session_sets')
        .select('reps, weight')
        .eq('training_session_id', lastSession.id)
  
      if (!setsData || setsData.length === 0) return
  
      trainingSets.value = setsData.map(s => ({
        reps: s.reps,
        weight: s.weight
      }))
      copiedFromLast.value = true
    } catch (err) {
      console.error('Fehler bei loadLastTraining:', err)
    }
  }
  
  async function saveTraining() {
    errorMessage.value = ''
    successMessage.value = ''
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: insertSessionData, error: insertSessionError } = await supabase
        .from('training_sessions')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          note: trainingNote.value,
        })
        .select('*')
        .single()
  
      if (insertSessionError) throw insertSessionError
      const newSessionId = insertSessionData.id
  
      if (trainingSets.value.length > 0) {
        const inserts = trainingSets.value.map(s => ({
          training_session_id: newSessionId,
          reps: s.reps || 0,
          weight: s.weight || 0
        }))
        const { error: setInsertError } = await supabase
          .from('training_session_sets')
          .insert(inserts)
        if (setInsertError) throw setInsertError
      }
  
      successMessage.value = 'Training erfolgreich gespeichert!'
      trainingNote.value = ''
      trainingSets.value = []
      copiedFromLast.value = false
      await reloadTrainings()
    } catch (err) {
      console.error('Fehler beim Speichern des Trainings:', err)
      errorMessage.value = 'Fehler beim Speichern des Trainings.'
    }
  }
  
  function addSet() {
    trainingSets.value.push({ reps: null, weight: null })
  }
  function removeSet(index) {
    trainingSets.value.splice(index, 1)
  }
  
  async function reloadTrainings() {
    const { data: sessionsData } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: true })
  
    let allSets = []
    if (sessionsData && sessionsData.length > 0) {
      const sessionIds = sessionsData.map(s => s.id)
      const { data: setsData } = await supabase
        .from('training_session_sets')
        .select('*')
        .in('training_session_id', sessionIds)
      allSets = setsData || []
    }
  
    trainingsByDate.value = {}
    sessionsData?.forEach(session => {
      const dayKey = formatDayKey(session.created_at)
      session.sets = allSets.filter(s => s.training_session_id === session.id)
      if (!trainingsByDate.value[dayKey]) {
        trainingsByDate.value[dayKey] = []
      }
      trainingsByDate.value[dayKey].push(session)
    })
  
    generateCalendar(year.value, month.value)
  }
  
  function goToPreviousMonth() {
    if (month.value === 0) {
      month.value = 11
      year.value -= 1
    } else {
      month.value -= 1
    }
    generateCalendar(year.value, month.value)
  }
  
  function goToNextMonth() {
    if (month.value === 11) {
      month.value = 0
      year.value += 1
    } else {
      month.value += 1
    }
    generateCalendar(year.value, month.value)
  }
  
  function generateCalendar(y, m) {
    calendarRows.value = []
    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    let startWeekday = firstDay.getDay()
    if (startWeekday === 0) startWeekday = 7
    const totalDays = lastDay.getDate()
  
    for (let row = 0; row < 6; row++) {
      const weekRow = []
      for (let col = 1; col <= 7; col++) {
        const dayIndex = row * 7 + col
        const dayCalc = dayIndex - (startWeekday - 1)
  
        let dayNum = null
        let isCurrentMonth = false
        let hasTraining = false
  
        if (dayCalc > 0 && dayCalc <= totalDays) {
          dayNum = dayCalc
          isCurrentMonth = true
        }
  
        let dateObj = null
        if (isCurrentMonth) {
          dateObj = new Date(y, m, dayNum)
          const dayKey = formatDayKey(dateObj)
          if (trainingsByDate.value[dayKey] && trainingsByDate.value[dayKey].length > 0) {
            hasTraining = true
          }
        }
  
        weekRow.push({
          date: dateObj,
          dayNum: dayNum || '',
          isCurrentMonth,
          hasTraining
        })
      }
      calendarRows.value.push(weekRow)
      if (weekRow.some(d => d.dayNum === totalDays)) {
        break
      }
    }
  }
  
  function dayClicked(dayObj) {
    if (!dayObj.isCurrentMonth || !dayObj.hasTraining) return
    const dayKey = formatDayKey(dayObj.date)
    dayTrainings.value = trainingsByDate.value[dayKey] || []
    selectedDayLabel.value = dayKey
    showModal.value = true
  }
  function closeModal() {
    showModal.value = false
    dayTrainings.value = []
  }
  
  // Hilfsfunktionen
  function formatDayKey(dateOrString) {
    const d = new Date(dateOrString)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  function formatDate(isoStr) {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    return d.toLocaleString()
  }
  
  function isYoutube(url) {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be')
  }
  
  function getEmbeddedUrl(url) {
    let match = url.match(/[?&]v=([^&]+)/)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
    match = url.match(/youtu\.be\/([^?]+)/)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
    match = url.match(/\/shorts\/([^?]+)/)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
    return url
  }
  </script>
  
  <style scoped>
  /* Basis-Layout */
  .app-wrapper {
    min-height: 100vh;
    background: inherit;
  }
  
  .main-layout {
    display: grid;
    grid-template-columns: 1fr 500px;
    gap: 2rem;
    padding: 2rem;
    max-width: 1600px;
    margin: 0 auto;
  }
  
  /* Left Column */
  .content-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  /* Video Section – mit max-height, damit das Video nicht den gesamten Bildschirm einnimmt */
  .video-section {
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    padding-top: 56.25%;
    max-height: 500px;
  }
  
  .video-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  .video-iframe {
    width: 100%;
    height: 100%;
  }
  
  .details-section {
    /* Optional: Abstand zur Video-Sektion */
    margin-top: 1rem;
  }
  
  .details-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .workout-title {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  .workout-description {
    color: #555;
    line-height: 1.6;
  }
  
  /* Right Column */
  .sidebar-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .sidebar-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .card-title {
    font-size: 1.1rem;
    color: #34495e;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  /* Training Form */
  .training-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .note-input {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    resize: vertical;
    min-height: 100px;
  }
  
  .sets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .sets-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .set-item {
    display: grid;
    grid-template-columns: 40px 70px 70px 40px;
    gap: 0.5rem;
    align-items: center;
  }
  
  .set-number {
    text-align: center;
  }
  
  .set-input {
    width: 70px;
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    text-align: center;
  }
  
  .save-button {
    background: #3498db;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .save-button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
  
  /* Calendar */
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .calendar-header-text {
    margin: 0 0.75rem;
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .calendar-grid {
    display: grid;
    gap: 4px;
  }
  
  .calendar-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 4px;
  }
  
  .calendar-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    background: #f5f6fa;
    color: #7f8c8d;
  }
  
  .calendar-day.current-month {
    color: #2c3e50;
    background: #fff;
    border: 2px solid #e0e0e0;
  }
  
  .calendar-day.has-training {
    background: #ffeaa7;
    border-color: #fdcb6e;
    font-weight: 600;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(3px);
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow: auto;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #7f8c8d;
  }
  
  .training-details + .training-details {
    margin-top: 1rem;
  }
  
  /* Utility Classes */
  .icon-button {
    background: none;
    border: none;
    padding: 0.5rem;
    color: #7f8c8d;
    transition: all 0.2s;
    cursor: pointer;
  }
  
  .icon-button:hover {
    color: #3498db;
  }
  
  .danger {
    color: #e74c3c;
  }
  
  .state-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
  }
  
  .error {
    color: #e74c3c;
    font-weight: 500;
    padding: 2rem;
    text-align: center;
  }
  
  .success-message {
    color: #27ae60;
    background: #e8f6ef;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  </style>
  