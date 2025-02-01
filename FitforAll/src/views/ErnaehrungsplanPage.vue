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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// 1) Vordefinierte Pläne (Cut, Stay, Bulk)
const predefinedPlans = ref([
  {
    id: 1,
    title: 'Cut',
    description:
      'Reduziere Kalorien und fördere Fettabbau mit unserem professionellen vegetarischen Cut-Plan.',
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

// 2) Ernährungsweisen + 3) Allergien (Mehrfach-Checkbox)
const dietaryOptions = [
  { value: 'vegetarisch', label: 'Vegetarisch' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarisch', label: 'Pescetarisch' },
  { value: 'lowcarb', label: 'Low-Carb' }
]
const allergyOptions = [
  { value: 'nussallergie', label: 'Nussallergie' },
  { value: 'laktose', label: 'Laktoseintoleranz' },
  { value: 'gluten', label: 'Glutenunverträglichkeit' },
  { value: 'eiallergie', label: 'Eiallergie' }
]

// 4) Form-Daten
const formData = ref({
  goal: '',
  height: null,
  weight: null,
  dietaryPreferences: [],
  allergies: []
})

/* 
  HINWEIS: Wir tun hier so, als hätten wir "Mahlzeitenabschnitte" 
  ähnlich wie bei deinem Screenshot:
  - Nach dem Aufstehen
  - Frühstück
  - Mittagessen
  - Post-Workout
  - Abendessen
  - Bedtime
  Jede Section enthält "items" (Lebensmittel, Menge, Kcal, Fett, KH, Protein)
  + eine Summenzeile.  
*/

// ============  HILFSFUNKTIONEN ============

/** 
 * (A) Holen der "Demo"-Mahlzeitenabschnitte für Cut, Stay, Bulk.
 * Du kannst hier so viele Abschnitte hinzufügen, wie du möchtest.
 */
function getMealSectionsForPlan(planTitle) {
  // Minimales Template für alle Pläne:
  const base = [
    {
      title: 'Nach dem Aufstehen',
      items: [
        ['Milch 0,3 %', '250 ml', '87', '0,8', '12,0', '8,8'],
        ['Protein Shake (Veg.)', '30 g', '120', '1,5', '3,0', '23']
      ]
    },
    {
      title: 'Frühstück',
      items: [
        ['Haferflocken', '80 g', '300', '5,7', '50,0', '10,0'],
        ['Banane', '100 g', '89', '0,3', '23,0', '1,1']
      ]
    },
    {
      title: 'Mittagessen',
      items: [
        ['Vollkornreis', '100 g', '352', '2,2', '74,1', '7,8'],
        ['Tofu', '150 g', '180', '10,0', '3,0', '18,0']
      ]
    },
    {
      title: 'Post-Workout',
      items: [
        ['BCAA-Drink', '1 Portion', '50', '0,0', '0,0', '12,0'],
        ['Banane', '100 g', '89', '0,3', '23,0', '1,1']
      ]
    },
    {
      title: 'Abendessen',
      items: [
        ['Gemüsepfanne', '200 g', '120', '2,5', '18,0', '5,0'],
        ['Vollkornbrot', '50 g', '107', '1,2', '19,0', '4,0']
      ]
    },
    {
      title: 'Bedtime',
      items: [
        ['Magerquark', '100 g', '66', '0,3', '4,0', '12,0']
      ]
    }
  ]

  // Dann je nach Plan minimal andere Kcal etc. anpassen
  // (Oder du machst komplett eigene Datensätze.)
  if (planTitle.toLowerCase() === 'cut') {
    // z.B. bei "Cut" => wir reduzieren ein bisschen Kcal...
    // hier extrem vereinfacht: wir tauschen Magerquark gegen Sojaquark mit weniger Kcal
    base[5].items = [
      ['Sojaquark', '100 g', '58', '0,2', '2,0', '10,0']
    ]
  } else if (planTitle.toLowerCase() === 'bulk') {
    // => Erhöhen Kcal
    // z.B. wir fügen Erdnussbutter beim Frühstück hinzu
    base[1].items.push(['Erdnussbutter', '20 g', '120', '9,0', '3,0', '5,0'])
  }

  // Summenzeilen berechnen
  return base.map(section => {
    const sumRow = calcSumRow(section.items)
    return { ...section, sumRow }
  })
}

/**
 * (B) Summen-Rechner für ein "items"-Array
 * items: [ ['Milch 0,3 %', '250 ml', '87', '0,8', '12,0', '8,8'], ... ]
 */
function calcSumRow(items) {
  let sumKcal = 0, sumFett = 0, sumKh = 0, sumProt = 0
  items.forEach(row => {
    sumKcal += parseFloat(row[2]) || 0
    sumFett += parseFloat(row[3]) || 0
    sumKh += parseFloat(row[4]) || 0
    sumProt += parseFloat(row[5]) || 0
  })
  return [
    'Gesamt', '', 
    sumKcal.toFixed(1),
    sumFett.toFixed(1),
    sumKh.toFixed(1),
    sumProt.toFixed(1)
  ]
}

/**
 * (C) Funktion, die eine PDF-Tabelle mit autoTable für die Abschnitte erstellt.
 * Wir verwenden das in "downloadPlan" (vordefiniert) und "generateCustomPlan" (individuell).
 */
function createPdfFromMealSections(doc, mealSections, planTitle) {
  // Kopfzeile
  doc.setFontSize(16)
  doc.text(`${planTitle} - Professioneller Ernährungsplan`, 14, 20)

  doc.setFontSize(12)
  doc.text(`Trainings-/Ernährungstag`, 14, 30)

  let currentY = 40
  let totalKcal = 0
  let totalFett = 0
  let totalKh = 0
  let totalProtein = 0

  mealSections.forEach(section => {
    doc.text(section.title, 14, currentY)

    const head = [['Lebensmittel', 'Menge', 'Kcal', 'Fett (g)', 'KH (g)', 'Protein (g)']]
    const body = section.items

    // Haupt-Tabelle
    autoTable(doc, {
      startY: currentY + 5,
      head,
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 140, 0] },
      theme: 'striped'
    })

    // Summenzeile
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      body: [section.sumRow],
      styles: { fontSize: 10 },
      theme: 'grid'
    })

    // Summen addieren
    const sumKcal = parseFloat(section.sumRow[2]) || 0
    const sumFett = parseFloat(section.sumRow[3]) || 0
    const sumKh = parseFloat(section.sumRow[4]) || 0
    const sumProt = parseFloat(section.sumRow[5]) || 0

    totalKcal += sumKcal
    totalFett += sumFett
    totalKh += sumKh
    totalProtein += sumProt

    currentY = doc.lastAutoTable.finalY + 10
  })

  // Gesamter Tagesbedarf
  doc.text('Gesamt:', 14, currentY)
  autoTable(doc, {
    startY: currentY + 5,
    body: [
      ['Kalorien (kcal)', totalKcal.toFixed(1)],
      ['Fett (g)', totalFett.toFixed(1)],
      ['Kohlenhydrate (g)', totalKh.toFixed(1)],
      ['Protein (g)', totalProtein.toFixed(1)]
    ],
    styles: { fontSize: 10 },
    theme: 'grid'
  })

  doc.setFontSize(10)
  doc.text(
    'Hinweis: Dies ist ein vereinfachtes Beispiel.\nFür eine echte Ernährungsberatung bitte mehr Faktoren einbeziehen (Alter, Geschlecht, Allergien etc.).',
    14,
    doc.lastAutoTable.finalY + 10
  )
}

/**
 * (D) Filtern von tierischen Produkten bei "vegan" etc., 
 * sowie Filtern von Allergien. 
 * (Das ist weiterhin sehr grob.)
 */
function filterItemsForDietAndAllergies(items, dietaryPrefs, allergies) {
  return items.filter(row => {
    const foodName = row[0].toLowerCase()

    // Vegan => Tierisches rausfiltern
    if (dietaryPrefs.includes('vegan')) {
      if (foodName.includes('milch')) return false
      if (foodName.includes('butter')) return false
      if (foodName.includes('käse')) return false
      if (foodName.includes('quark')) return false
      if (foodName.includes('ei') && !foodName.includes('eiweißpulver')) return false
      // und so weiter ...
    }

    // Allergien => Bsp: nussallergie => no "nuss", "mandel", "erdnuss" etc.
    if (allergies.includes('nussallergie')) {
      if (foodName.includes('nuss') || foodName.includes('mandel') || foodName.includes('erdnuss')) return false
    }
    if (allergies.includes('laktose')) {
      if (foodName.includes('milch') || foodName.includes('käse') || foodName.includes('butter') || foodName.includes('quark')) return false
    }
    if (allergies.includes('gluten')) {
      if (foodName.includes('weizen') || foodName.includes('volkornbrot') || foodName.includes('nudel') || foodName.includes('haferflocken')) {
        return false
      }
    }
    if (allergies.includes('eiallergie')) {
      if (foodName.includes('ei') && !foodName.includes('eiweißpulver')) return false
    }

    return true
  })
}

/**
 * (E) "Vordefinierte Pläne" => klick auf "Plan herunterladen"
 */
function downloadPlan(plan) {
  const doc = new jsPDF()
  // 1. Holen wir uns die fertigen Abschnitte
  let mealSections = getMealSectionsForPlan(plan.title)
  // 2. In diesem Demo: Wir tun so, als ob "Cut" / "Bulk" / "Stay" fix sind => kein Filter

  createPdfFromMealSections(doc, mealSections, plan.title)
  doc.save(`${plan.title}-Plan.pdf`)
}

/**
 * (F) "Individuellen Plan" => klick auf "Plan generieren"
 * Wir bauen jetzt dieselben Abschnitte auf (z. B. wie getMealSectionsForPlan),
 * filtern sie dann nach "vegan" usw., und rechnen Summen neu aus.
 */
function generateCustomPlan() {
  const { goal, dietaryPreferences, allergies, height, weight } = formData.value

  // 1. Basisabschnitte je nach Ziel
  let mealSections = getMealSectionsForPlan(goal)

  // 2. Filtern je Abschnitt
  mealSections = mealSections.map(section => {
    // row = [Lebensmittel, Menge, Kcal, Fett, KH, Protein]
    const filteredItems = filterItemsForDietAndAllergies(section.items, dietaryPreferences, allergies)
    const sumRow = calcSumRow(filteredItems)
    return { ...section, items: filteredItems, sumRow }
  })

  // 3. Dann könnten wir noch die Kcal anpassen
  //    => z. B. minimaler "Schein-Rechner":
  //    => [Ganz am Ende: Du könntest Summe an (height, weight) anpassen]

  // 4. PDF bauen
  const doc = new jsPDF()
  // Kopf-Infos
  doc.setFontSize(16)
  doc.text('Individueller Ernährungsplan', 14, 20)

  doc.setFontSize(12)
  doc.text(`Ziel: ${goal}`, 14, 30)
  doc.text(`Größe: ${height} cm`, 14, 40)
  doc.text(`Gewicht: ${weight} kg`, 14, 50)
  doc.text(`Ernährungsweisen: ${dietaryPreferences.join(', ') || 'keine'}`, 14, 60)
  doc.text(`Allergien: ${allergies.join(', ') || 'keine'}`, 14, 70)

  // Ab ~80: Tabellen
  let currentY = 80
  let totalKcal = 0
  let totalFett = 0
  let totalKh = 0
  let totalProtein = 0

  mealSections.forEach(section => {
    doc.text(section.title, 14, currentY)

    const head = [['Lebensmittel', 'Menge', 'Kcal', 'Fett (g)', 'KH (g)', 'Protein (g)']]
    const body = section.items

    autoTable(doc, {
      startY: currentY + 5,
      head,
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 140, 0] },
      theme: 'striped'
    })

    // Summenzeile
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      body: [section.sumRow],
      styles: { fontSize: 10 },
      theme: 'grid'
    })

    // Summen addieren
    const sumKcal = parseFloat(section.sumRow[2]) || 0
    const sumFett = parseFloat(section.sumRow[3]) || 0
    const sumKh = parseFloat(section.sumRow[4]) || 0
    const sumProt = parseFloat(section.sumRow[5]) || 0

    totalKcal += sumKcal
    totalFett += sumFett
    totalKh += sumKh
    totalProtein += sumProt

    currentY = doc.lastAutoTable.finalY + 10
  })

  // 5. Gesamt
  doc.text('Gesamt (Individueller Plan):', 14, currentY)
  autoTable(doc, {
    startY: currentY + 5,
    body: [
      ['Kalorien (kcal)', totalKcal.toFixed(1)],
      ['Fett (g)', totalFett.toFixed(1)],
      ['Kohlenhydrate (g)', totalKh.toFixed(1)],
      ['Protein (g)', totalProtein.toFixed(1)]
    ],
    styles: { fontSize: 10 },
    theme: 'grid'
  })

  doc.setFontSize(10)
  doc.text(
    'Dies ist ein vereinfachtes Beispiel.\nFür eine echte Beratung mehr Daten berücksichtigen und reale Nährwerte verwenden.',
    14,
    doc.lastAutoTable.finalY + 10
  )

  doc.save('Individueller-Ernährungsplan.pdf')
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
