<template>
  <PageLayout
    pageTitle="Ernährungsplan"
    pageSubtitle="Dein Weg zur optimalen Ernährung"
  >
    <template #default>
      <div class="ernaehrungsplan-page container">
        <!-- Überschrift: -->
        <h2 class="text-center mb-5 fw-bold">Vegetarische Ernährungspläne</h2>

        <!-- Vordefinierte Ernährungspläne (CUT, STAY, BULK) -->
        <div class="row justify-content-center">
          <div
            v-for="plan in predefinedPlans"
            :key="plan.id"
            class="col-md-4 mb-4"
          >
            <div class="card h-100">
              <!-- Bild (optional) -->
              <img
                v-if="plan.imageUrl"
                :src="plan.imageUrl"
                class="card-img-top"
                :alt="'Bild - ' + plan.title"
              >
              <div class="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 class="card-title">{{ plan.title }}</h5>
                  <p class="card-text">{{ plan.description }}</p>
                </div>
                <button
                  class="btn btn-warning mt-3"
                  @click="downloadPlan(plan)"
                >
                  Plan herunterladen
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trennlinie -->
        <hr class="my-5" />

        <!-- Individueller Ernährungsplan-Generator -->
        <h2 class="text-center mb-4 fw-bold">Individuellen Ernährungsplan erstellen</h2>
        <div class="row justify-content-center">
          <div class="col-md-6">
            <form @submit.prevent="generateCustomPlan">
              <!-- Ziel (cut, stay, bulk) -->
              <div class="mb-3">
                <label for="goal" class="form-label">Dein Ziel</label>
                <select
                  id="goal"
                  class="form-select"
                  v-model="formData.goal"
                  required
                >
                  <option value="" disabled>Wähle ein Ziel</option>
                  <option value="cut">Cut</option>
                  <option value="stay">Stay</option>
                  <option value="bulk">Bulk</option>
                </select>
              </div>

              <!-- Größe -->
              <div class="mb-3">
                <label for="height" class="form-label">Deine Größe (cm)</label>
                <input
                  id="height"
                  type="number"
                  class="form-control"
                  v-model="formData.height"
                  required
                />
              </div>

              <!-- Gewicht -->
              <div class="mb-3">
                <label for="weight" class="form-label">Dein Gewicht (kg)</label>
                <input
                  id="weight"
                  type="number"
                  class="form-control"
                  v-model="formData.weight"
                  required
                />
              </div>

              <!-- Ernährungsweise (MEHRFACH-Auswahl per Checkbox) -->
              <div class="mb-3">
                <label class="form-label">Ernährungsweise</label>
                <div
                  v-for="option in dietaryOptions"
                  :key="option.value"
                  class="form-check"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="option.value"
                    v-model="formData.dietaryPreferences"
                    :id="'diet-'+option.value"
                  />
                  <label
                    class="form-check-label"
                    :for="'diet-'+option.value"
                  >
                    {{ option.label }}
                  </label>
                </div>
              </div>

              <!-- Allergien (MEHRFACH-Auswahl per Checkbox) -->
              <div class="mb-3">
                <label class="form-label">Allergien / Unverträglichkeiten</label>
                <div
                  v-for="allergy in allergyOptions"
                  :key="allergy.value"
                  class="form-check"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="allergy.value"
                    v-model="formData.allergies"
                    :id="'allergy-'+allergy.value"
                  />
                  <label
                    class="form-check-label"
                    :for="'allergy-'+allergy.value"
                  >
                    {{ allergy.label }}
                  </label>
                </div>
              </div>

              <button type="submit" class="btn btn-warning w-100">
                Plan generieren
              </button>
            </form>
          </div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script setup>
import { ref } from 'vue'
import PageLayout from './PageLayout.vue'

// ========== 1) Cards (Cut, Stay, Bulk) mit Bildern ==========
const predefinedPlans = ref([
  {
    id: 1,
    title: 'Cut',
    description:
      'Reduziere gezielt Kalorien und fördere Fettabbau mit unserem professionellen vegetarischen Cut-Plan.',
    imageUrl: new URL('/assets/Cut.png', import.meta.url).href
  },
  {
    id: 2,
    title: 'Stay',
    description:
      'Halte dein Gewicht stabil und bleibe fit mit unserem ausgewogenen vegetarischen Stay-Plan.',
    imageUrl: new URL('/assets/Stay.png', import.meta.url).href
  },
  {
    id: 3,
    title: 'Bulk',
    description:
      'Erhöhe deine Kalorienzufuhr und baue effektiv Muskeln auf mit unserem vegetarischen Bulk-Plan.',
    imageUrl: new URL('/assets/Bulk.png', import.meta.url).href
  }
])

// ========== 2) Ernährungsweise (Checkboxen) ==========
const dietaryOptions = [
  { value: 'vegetarisch', label: 'Vegetarisch' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarisch', label: 'Pescetarisch' },
  { value: 'lowcarb', label: 'Low-Carb' }
]

// ========== 3) Allergien (Checkboxen) ==========
const allergyOptions = [
  { value: 'nussallergie', label: 'Nussallergie' },
  { value: 'laktose', label: 'Laktoseintoleranz' },
  { value: 'gluten', label: 'Glutenunverträglichkeit' },
  { value: 'eiallergie', label: 'Eiallergie' }
]

// ========== 4) Formulardaten ==========
const formData = ref({
  goal: '',
  height: null,
  weight: null,

  // Mehrfachauswahl via Arrays
  dietaryPreferences: [],
  allergies: []
})

// ========== 5) Funktionen ==========
function downloadPlan(plan) {
  alert(`Der "${plan.title}"-Plan wird heruntergeladen...`)
}

function generateCustomPlan() {
  const chosenDiets = formData.value.dietaryPreferences.join(', ') || 'keine'
  const chosenAllergies = formData.value.allergies.join(', ') || 'keine'

  alert(
    `Dein individueller Plan wird erstellt:\n` +
    `- Ziel: ${formData.value.goal}\n` +
    `- Größe: ${formData.value.height} cm\n` +
    `- Gewicht: ${formData.value.weight} kg\n` +
    `- Ernährungsweisen: ${chosenDiets}\n` +
    `- Allergien: ${chosenAllergies}\n\n` +
    `Ein detaillierter Ernährungsplan wird generiert und steht gleich zum Download bereit.`
  )
}
</script>

<style scoped>
.ernaehrungsplan-page {
  max-width: 900px;
  margin: 0 auto;
}

/* Card-Styling */
.card {
  border: 1px solid #ddd;
  border-radius: 6px;
}

.card-body {
  text-align: center;
}

/* Bild oben in der Card */
.card-img-top {
  max-height: 200px;
  object-fit: cover;
}

/* Trennlinie */
hr {
  margin: 3rem 0;
}
</style>
