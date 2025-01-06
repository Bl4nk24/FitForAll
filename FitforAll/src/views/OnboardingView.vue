<template>
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Willkommen bei FitforAll!</h3>
            </div>
            <div class="card-body">
              <p class="text-muted">
                Bitte wähle deine bevorzugten Einstellungen zur Barrierefreiheit und teile uns
                mit, ob besondere körperliche Einschränkungen berücksichtigt werden sollen.
              </p>
  
              <form @submit.prevent="saveAccessibilityPreferences">
                <!-- Farbschema -->
                <div class="mb-3">
                  <label class="form-label">Farbschema</label>
                  <select class="form-select" v-model="colorContrast">
                    <option value="normal">Normal</option>
                    <option value="high-contrast">Hoher Kontrast</option>
                    <option value="dark">Dunkles Design</option>
                  </select>
                </div>
  
                <!-- Schriftgröße -->
                <div class="mb-3">
                  <label class="form-label">Schriftgröße</label>
                  <select class="form-select" v-model="fontSize">
                    <option value="normal">Normal</option>
                    <option value="large">Groß</option>
                    <option value="x-large">Extra Groß</option>
                  </select>
                </div>
  
                <!-- Screenreader -->
                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="screenreader"
                    v-model="screenreader"
                  />
                  <label for="screenreader" class="form-check-label">
                    Screenreader-Modus aktivieren
                  </label>
                </div>
  
                <hr />
  
                <!-- Körperliche Einschränkungen -->
                <div class="mb-3">
                  <label class="form-label fw-bold"
                    >Körperliche Einschränkungen / besondere Bedürfnisse</label
                  >
                  <div class="form-check" v-for="option in limitationOptions" :key="option.value">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="option.value"
                      :value="option.value"
                      v-model="physicalLimitations"
                    />
                    <label class="form-check-label" :for="option.value">
                      {{ option.label }}
                    </label>
                  </div>
                </div>
  
                <!-- Freitextfeld: weitere Hinweise -->
                <div class="mb-3">
                  <label for="otherLimitations" class="form-label"
                    >Weitere Hinweise (optional)</label
                  >
                  <textarea
                    class="form-control"
                    id="otherLimitations"
                    rows="3"
                    v-model="otherLimitations"
                    placeholder="Hast du weitere gesundheitliche Einschränkungen oder Wünsche?"
                  ></textarea>
                </div>
  
                <button type="submit" class="btn btn-success w-100">
                  Speichern & Weiter
                </button>
              </form>
  
              <div v-if="errorMessage" class="alert alert-danger mt-3">
                {{ errorMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { supabase } from '../supabase'
  import { useRouter } from 'vue-router'
  
  // Formfelder
  const colorContrast = ref('normal')
  const fontSize = ref('normal')
  const screenreader = ref(false)
  const physicalLimitations = ref([]) // Array für Checkbox-Auswahl
  const otherLimitations = ref('')
  
  // mögliche körperliche Einschränkungen als Auswahl
  const limitationOptions = [
    { value: 'rollstuhl', label: 'Rollstuhl erforderlich' },
    { value: 'sehbehinderung', label: 'Sehbehinderung' },
    { value: 'hörbehinderung', label: 'Hörbehinderung' },
    { value: 'prothese', label: 'Prothese / Amputation' },
    { value: 'chronische_schmerzen', label: 'Chronische Schmerzen' },
  ]
  
  const errorMessage = ref('')
  const router = useRouter()
  
  onMounted(async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      // Falls kein User eingeloggt -> Auth-Seite
      router.push('/auth')
      return
    }
  
    // Profil laden (falls User schon einmal Onboarding begonnen hat)
    const { data: profileData, error } = await supabase
      .from('user_settings')
      .select(
        'has_finished_onboarding, color_contrast, font_size, screenreader, physical_limitations'
      )
      .eq('user_id', authData.user.id)
      .single()
  
    if (error) {
      console.warn('Profil konnte nicht geladen werden:', error.message)
      return
    }
  
    if (profileData) {
      // Falls Onboarding schon abgeschlossen, direkt zur Startseite
      if (profileData.has_finished_onboarding) {
        router.push('/')
        return
      }
      // Vorauswahl füllen
      colorContrast.value = profileData.color_contrast || 'normal'
      fontSize.value = profileData.font_size || 'normal'
      screenreader.value = profileData.screenreader || false
      physicalLimitations.value = profileData.physical_limitations || []
    }
  })
  
  async function saveAccessibilityPreferences() {
    errorMessage.value = ''
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      router.push('/auth')
      return
    }
  
    // Merken, ob wir noch ein "others"-Feld anhängen
    // (wenn du das 'otherLimitations' mit ins Array packen möchtest)
    let mergedLimitations = [...physicalLimitations.value]
    if (otherLimitations.value.trim().length > 0) {
      mergedLimitations.push('Andere: ' + otherLimitations.value)
    }
  
    // Update der profiles-Tabelle
    const { error } = await supabase
      .from('user_settings')
      .update({
        color_contrast: colorContrast.value,
        font_size: fontSize.value,
        screenreader: screenreader.value,
        physical_limitations: mergedLimitations, // text[]
        has_finished_onboarding: true
      })
      .eq('user_id', authData.user.id)
  
    if (error) {
      errorMessage.value = error.message
    } else {
      // Weiterleitung zur Home-Seite
      router.push('/')
    }
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
  }
  .card-header {
    font-weight: 600;
  }
  </style>
  