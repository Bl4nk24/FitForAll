<template>
    <div class="container my-5" style="max-width: 900px;">
        <!-- Ladezustand / Fehlerzustand -->
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
            <!-- Titel -->
            <h2 class="mb-3">{{ workout.name }}</h2>

            <!-- EINGEBETTETES VIDEO (YouTube) oder externer Link -->
            <div class="ratio ratio-16x9 mb-3" v-if="isYoutube(workout.video_url)">
                <iframe :src="getEmbeddedUrl(workout.video_url)" frameborder="0" allowfullscreen></iframe>
            </div>
            <div v-else class="mb-4">
                <strong>Video-Link:</strong>
                <a :href="workout.video_url" target="_blank">{{ workout.video_url }}</a>
            </div>

            <!-- Beschreibung -->
            <p class="mb-4">
                {{ workout.description }}
            </p>

            <!-- Now render the (modified) SVG string -->
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h5 class="mb-0">Trainierte Muskeln</h5>
                </div>
                <div class="card-body">
                    <div class="svg-container mb-4" v-html="svgContent">

                    </div>
                </div>
            </div>

            <!-- Neues Training anlegen -->
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h5 class="mb-0">Neues Training</h5>
                </div>
                <div class="card-body">
                    <!-- Erfolgsmeldung -->
                    <div v-if="successMessage" class="alert alert-success">
                        {{ successMessage }}
                    </div>

                    <!-- Notiz zum Training -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Notiz zum Training</label>
                        <textarea class="form-control" rows="2" v-model="trainingNote"
                            placeholder="z.B. Allgemeines Befinden, Ziel, etc."></textarea>
                    </div>

                    <hr />
                    <h6>Sätze hinzufügen:</h6>
                    <p class="text-muted" v-if="copiedFromLast">
                        <em>Sätze aus deinem letzten Training übernommen.</em>
                    </p>

                    <!-- Sätze-Liste -->
                    <div class="row g-2 align-items-end" v-for="(item, index) in trainingSets" :key="index"
                        style="margin-bottom: 1rem;">
                        <div class="col-4">
                            <label class="form-label">Reps</label>
                            <input type="number" min="1" class="form-control" v-model.number="item.reps"
                                placeholder="z.B. 10" />
                        </div>
                        <div class="col-4">
                            <label class="form-label">Gewicht (kg)</label>
                            <input type="number" step="0.5" min="0" class="form-control" v-model.number="item.weight"
                                placeholder="z.B. 40" />
                        </div>
                        <div class="col-4">
                            <button class="btn btn-danger" @click="removeSet(index)">
                                Entfernen
                            </button>
                        </div>
                    </div>

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

            <!-- Kalender (Monat) -->
            <div class="card" v-if="calendarRows.length > 0">
                <div class="card-header bg-light">
                    <h5 class="mb-0">Kalender für {{ monthName }} {{ year }}</h5>
                </div>
                <div class="card-body">
                    <p class="text-muted">
                        Klick auf einen Tag, um Details zum Training anzuzeigen.
                    </p>

                    <table class="table text-center">
                        <thead>
                            <tr>
                                <th>Mo</th>
                                <th>Di</th>
                                <th>Mi</th>
                                <th>Do</th>
                                <th>Fr</th>
                                <th>Sa</th>
                                <th>So</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(week, windex) in calendarRows" :key="windex">
                                <td v-for="(dayObj, dindex) in week" :key="dindex"
                                    :class="dayObj.isCurrentMonth ? '' : 'text-muted'">
                                    <div class="day-cell" :class="{ 'has-training': dayObj.hasTraining }"
                                        @click="dayClicked(dayObj)">
                                        {{ dayObj.dayNum }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Kein Workout gefunden -->
        <div v-else class="alert alert-warning">
            Kein Workout mit dieser ID gefunden.
        </div>

        <!-- Modal: Trainings-Detail / Tag-Details -->
        <div class="modal fade" tabindex="-1" role="dialog" :class="{ show: showModal }" style="display: block"
            v-if="showModal">
            <div class="modal-dialog modal-lg" role="document" @click.stop>
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Training am {{ selectedDayLabel }}</h5>
                        <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <p v-if="dayTrainings.length === 0" class="text-muted">
                            Keine Trainingsdaten vorhanden.
                        </p>
                        <div v-else>
                            <div v-for="(session, index) in dayTrainings" :key="session.id"
                                class="mb-4 border-bottom pb-2">
                                <h6>Training #{{ index + 1 }} – {{ formatDate(session.created_at) }}</h6>
                                <p><strong>Notiz:</strong> {{ session.note || '-' }}</p>

                                <!-- Sätze anzeigen -->
                                <div v-if="session.sets && session.sets.length > 0">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Satz</th>
                                                <th>Reps</th>
                                                <th>Gewicht</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(setItem, i) in session.sets" :key="i">
                                                <td>{{ i + 1 }}</td>
                                                <td>{{ setItem.reps }}</td>
                                                <td>{{ setItem.weight }} kg</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p v-else class="text-muted">Keine Sätze gespeichert.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hintergrund Overlay fürs Modal -->
        <div class="modal-backdrop fade" :class="{ show: showModal }" v-if="showModal" @click.self="closeModal"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'

const route = useRoute()
const workoutId = route.params.id

// Loading & Errors
const loading = ref(true)
const errorMessage = ref('')
// Success info
const successMessage = ref('')

// Workout-Daten
const targetMuscles = ref([])

// Workout + SVG
const workout = ref(null)
const svgContent = ref("")  // Hier landet der SVG-Text

// Felder für "Neues Training"
const trainingNote = ref('')
const trainingSets = ref([])
const copiedFromLast = ref(false)

// Kalender / Modal
const showModal = ref(false)
const selectedDayLabel = ref('')
const dayTrainings = ref([])
const trainingsByDate = ref({})
// Aktueller Monat / Jahr
const year = new Date().getFullYear()
const month = new Date().getMonth()
const calendarRows = ref([])
// Monatsname
const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]
const monthName = computed(() => monthNames[month] || '')

// onMounted
onMounted(async () => {
    // 2) SVG laden
    try {
        const response = await fetch("/assets/Muscle_Map.svg");
        svgContent.value = await response.text();
    } catch (error) {
        console.error("Fehler beim Laden der SVG:", error);
    }
    try {
        // 1) Workout-Daten laden
        const { data: wData } = await supabase
            .from('workouts')
            .select('*')
            .eq('id', workoutId)
            .single()

        workout.value = wData

        targetMuscles.value = wData.target_muscles || []

        let content = svgContent.value
        content = markActiveMuscles(content, targetMuscles.value)
        svgContent.value = content

        // 4) Trainings-Daten (sessions + sets)
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

        // sessions -> date => arrays
        sessionsData.forEach(session => {
            const dayKey = formatDayKey(session.created_at)
            session.sets = allSets.filter(s => s.training_session_id === session.id)

            if (!trainingsByDate.value[dayKey]) {
                trainingsByDate.value[dayKey] = []
            }
            trainingsByDate.value[dayKey].push(session)
        })

        generateCalendar(year, month)

        // 5) Optional: Letztes Training -> Sätze ins Formular
        await loadLastTraining()
    } catch (err) {
        console.error('Fehler beim Laden:', err)
        errorMessage.value = 'Fehler beim Laden der Daten.'
    } finally {
        loading.value = false
    }
})

// Letztes Training -> Sätze übernehmen
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

// Training anlegen
async function saveTraining() {
    errorMessage.value = ''
    successMessage.value = ''

    try {
        // Neue Session
        const { data: insertSessionData, error: insertSessionError } = await supabase
            .from('training_sessions')
            .insert({
                workout_id: workoutId,
                note: trainingNote.value,
            })
            .select('*')
            .single()

        if (insertSessionError) throw insertSessionError
        const newSessionId = insertSessionData.id

        // Sätze
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

        // Erfolg
        successMessage.value = 'Training erfolgreich gespeichert!'
        trainingNote.value = ''
        trainingSets.value = []
        copiedFromLast.value = false

        // Kalender updaten
        await reloadTrainings()
    } catch (err) {
        console.error('Fehler beim Anlegen des Trainings:', err)
        errorMessage.value = 'Fehler beim Speichern des Trainings.'
    }
}

// Sätze-Logik
function addSet() {
    trainingSets.value.push({ reps: null, weight: null })
}
function removeSet(index) {
    trainingSets.value.splice(index, 1)
}

function markActiveMuscles(svgString, targetIds) {
    // For each muscle ID in targetMuscles, find the `class="s2"` for the correct path 
    // and add " active" => class="s2 active"
    //
    // A simplistic approach: use a regex that matches e.g. id="muscle001" followed by 
    // some substring up until class="s2" and insert " active". 
    // Be careful with real-world edge cases or do a small DOM parse.

    targetIds.forEach(id => {
        const re = new RegExp(`(id="${id}"[\\s\\S]*?class="s2)"`, 'g')
        svgString = svgString.replace(re, '$1 active')
    })
    return svgString
}


async function reloadTrainings() {
    // Neu sessions + sets
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
    sessionsData.forEach(session => {
        const dayKey = formatDayKey(session.created_at)
        session.sets = allSets.filter(s => s.training_session_id === session.id)

        if (!trainingsByDate.value[dayKey]) {
            trainingsByDate.value[dayKey] = []
        }
        trainingsByDate.value[dayKey].push(session)
    })

    generateCalendar(year, month)
}

// Kalender generieren
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

// Tag klick
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

// Tools
function formatDayKey(dateOrString) {
    // Falls "created_at" ein ISO-String ist:
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

// Check YouTube
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
    return url
}
</script>

<style scoped>
/* Tag-Zellen im Kalender */
.day-cell {
    cursor: pointer;
    width: 30px;
    height: 30px;
    margin: auto;
    line-height: 30px;
    border-radius: 4px;
    display: inline-block;
}

.day-cell.has-training {
    background-color: #ffc107;
    /* Gelb */
    color: #000;
    font-weight: 600;
}

/* Modal-Overlay */
.modal-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
    display: block;
}
</style>