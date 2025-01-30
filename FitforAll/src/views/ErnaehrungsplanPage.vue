<template>
  <PageLayout>
    <template #default>
      <div class="ernaehrungsplan-page container">
        <!-- Überschrift -->
        <h1 class="text-center mb-5 fw-bold">Vegetarische Ernährungspläne</h1>

        <!-- Vordefinierte Ernährungspläne (CUT, STAY, BULK) -->
        <div class="row justify-content-center">
          <div
            v-for="plan in predefinedPlans"
            :key="plan.id"
            class="col-md-4 mb-4"
          >
            <div class="card h-100">
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

              <!-- Ernährungsweise (Vegetarisch, Vegan, Normal) -->
              <div class="mb-3">
                <label for="preference" class="form-label">Ernährungsweise</label>
                <select
                  id="preference"
                  class="form-select"
                  v-model="formData.preference"
                  required
                >
                  <option value="vegetarisch">Vegetarisch</option>
                  <option value="vegan">Vegan</option>
                  <option value="normal">Normal</option>
                </select>
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
import { ref } from 'vue';
import PageLayout from './PageLayout.vue';

// Vordefinierte vegetarische Ernährungspläne (Cut, Stay, Bulk)
const predefinedPlans = ref([
  {
    id: 1,
    title: 'Cut',
    description:
      'Reduziere gezielt Kalorien und fördere Fettabbau mit unserem professionellen vegetarischen Cut-Plan.'
  },
  {
    id: 2,
    title: 'Stay',
    description:
      'Halte dein Gewicht stabil und bleibe fit mit unserem ausgewogenen vegetarischen Stay-Plan.'
  },
  {
    id: 3,
    title: 'Bulk',
    description:
      'Erhöhe deine Kalorienzufuhr und baue effektiv Muskeln auf mit unserem vegetarischen Bulk-Plan.'
  }
]);

// Daten für den individuellen Plan
const formData = ref({
  goal: '',
  height: null,
  weight: null,
  preference: 'vegetarisch'
});

// Platzhalter-Funktion zum Herunterladen eines fertigen Plans
function downloadPlan(plan) {
  // Hier könnte z. B. ein PDF generiert oder ein Download-Link abgerufen werden
  alert(`Der "${plan.title}"-Plan (vegetarisch) wird heruntergeladen...`);
}

// Platzhalter-Funktion zum Generieren eines individuellen Plans
function generateCustomPlan() {
  // Hier könnte eine API oder ein PDF-Generator aufgerufen werden, um den Plan zu erstellen
  // Anschließend kann eine Datei zum Download angeboten werden
  alert(
    `Dein individueller Plan wird erstellt:\n` +
    `- Ziel: ${formData.value.goal}\n` +
    `- Größe: ${formData.value.height} cm\n` +
    `- Gewicht: ${formData.value.weight} kg\n` +
    `- Ernährungsweise: ${formData.value.preference}\n\n` +
    `Ein detaillierter Ernährungsplan wird generiert und steht gleich zum Download bereit.`
  );
}
</script>

<style scoped>
.ernaehrungsplan-page {
  max-width: 900px;
  margin: 0 auto;
}

.card {
  border: 1px solid #ddd;
  border-radius: 6px;
}

.card-body {
  text-align: center;
}

hr {
  margin: 3rem 0;
}
</style>
