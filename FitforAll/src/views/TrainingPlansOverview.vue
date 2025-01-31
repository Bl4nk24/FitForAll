<template>
  <div class="training-plans-page container my-5" style="max-width: 900px;">
    <h1 class="mb-4">Deine Trainingspläne</h1>

    <!-- Ladezustand / Fehler -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Lade Daten...</p>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Hauptinhalt -->
    <div v-else>
      <!-- Buttons oben -->
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <h3 class="mb-0">Meine Pläne</h3>
        <div>
          <!-- Automatisch -->
          <button class="btn btn-success me-2" @click="showAutoWizard = true">
            Automatisch erstellen
          </button>
          <!-- Manuell -->
          <button class="btn btn-secondary" @click="showManualModal = true">
            Manuell erstellen
          </button>
        </div>
      </div>

      <!-- Liste der vorhandenen Pläne -->
      <div v-if="plans.length > 0">
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-center" v-for="(plan, index) in plans"
            :key="plan.id">
            <!-- Nur Plan-Name und Erstell-Datum -->
            <div>
              <strong>{{ plan.plan_name || 'Unbenannter Plan' }}</strong>
              <small class="text-muted ms-2">
                (Erstellt am: {{ formatDate(plan.created_at) }})
              </small>
            </div>

            <!-- Rechts: Buttons -->
            <div class="d-flex align-items-center">
              <!-- Training starten -->
              <router-link :to="`/training-plans/${plan.id}/start`" class="btn btn-success btn-sm me-2">
                Training starten
              </router-link>

              <!-- Detail-Link -->
              <router-link :to="`/training-plans/${plan.id}/detail`" class="btn btn-outline-primary btn-sm me-2">
                Anzeigen
              </router-link>

              <!-- Dropdown: 3-Punkte -->
              <div class="dropdown" @click.stop>
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button"
                  @click="toggleDropdown(index)">
                  ⋮
                </button>
                <!-- Menü -->
                <ul class="dropdown-menu dropdown-menu-end" :class="{ show: openDropdownIndex === index }">
                  <li>
                    <button class="dropdown-item" @click="renamePlan(plan, index)">
                      Umbenennen
                    </button>
                  </li>
                  <li>
                    <hr class="dropdown-divider" />
                  </li>
                  <li>
                    <button class="dropdown-item text-danger" @click="deletePlan(plan, index)">
                      Löschen
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="alert alert-info">
        Du hast noch keine Trainingspläne erstellt.
      </div>
    </div>

    <!-- Auto-Wizard (automatische Filterlogik) -->
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

// Steuern, welches Dropdown offen ist
const openDropdownIndex = ref(null)

// Wizard-States
const showAutoWizard = ref(false)
const showManualModal = ref(false)

onMounted(async () => {
  try {
    // Beispiel: User-Check
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Du bist nicht eingeloggt.')
    }

    // Trainingspläne laden
    const { data: plansData, error: plansError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', authData.user.id)  // Pläne nur für den aktuellen User
      .order('created_at', { ascending: false })
    if (plansError) throw plansError

    plans.value = plansData || []
  } catch (err) {
    console.error(err)
    errorMessage.value = err.message || 'Fehler beim Laden der Pläne.'
  } finally {
    loading.value = false
  }
})

// Callback: wenn ein neuer Plan erstellt wurde
function onPlanCreated(newPlan) {
  // Füge den Plan oben in die Liste ein
  plans.value.unshift(newPlan)
}

// Datum formatieren
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

// Dropdown toggeln
function toggleDropdown(idx) {
  if (openDropdownIndex.value === idx) {
    // Klick auf bereits geöffnetes => schließen
    openDropdownIndex.value = null
  } else {
    openDropdownIndex.value = idx
  }
}

// Plan umbenennen
async function renamePlan(plan, idx) {
  // Schließe Dropdown
  openDropdownIndex.value = null

  // Einfache Variante: Prompt
  const newName = prompt('Neuen Namen eingeben:', plan.plan_name || '')
  if (!newName || newName.trim() === plan.plan_name) {
    return // Abbruch oder unverändert
  }

  try {
    // Update in DB
    const { data: updated, error } = await supabase
      .from('training_plans')
      .update({ plan_name: newName.trim() })
      .eq('id', plan.id)
      .select('*')
      .single()

    if (error) throw error

    // Lokal in "plans" aktualisieren
    plans.value[idx] = updated
  } catch (err) {
    alert('Fehler beim Umbenennen: ' + err.message)
  }
}

// Plan löschen
async function deletePlan(plan, idx) {
  // Schließe Dropdown
  openDropdownIndex.value = null

  // Bestätigung
  const ok = confirm(
    `Möchtest du den Plan "${plan.plan_name}" wirklich löschen?`
  )
  if (!ok) return

  try {
    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', plan.id)

    if (error) {
      throw error
    }
    // Lokal entfernen
    plans.value.splice(idx, 1)
  } catch (err) {
    alert('Fehler beim Löschen: ' + err.message)
  }
}
</script>

<style scoped>
.training-plans-page {
  min-height: 70vh;
}

/* Ausklapp-Menü (Bootstrap) */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  display: none;
  /* Standard: none */

  /* Minimales Styling, du kannst Bootstrap-Klassen etc. verwenden */
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

/* Wenn .show => Menü sichtbar */
.dropdown-menu.show {
  display: block;
}
</style>
