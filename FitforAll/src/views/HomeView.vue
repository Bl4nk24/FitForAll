<template>
  <div class="home-page" aria-labelledby="pageTitle">
    <!-- Hero-Bereich (Titel, Untertitel, Call-to-Action) -->
    <section class="bg-primary text-white text-center py-5">
      <div class="container">
        <h1 id="pageTitle" class="display-4 fw-bold">Willkommen bei FitforAll</h1>
        <p class="lead">
          Das barrierefreie Online-Gym für jeden Körper und jede Fähigkeit
        </p>
        <button
          class="btn btn-light btn-lg mt-3"
          @click="gotoWorkouts"
          aria-label="Klicke hier, um zu den Workouts zu gelangen"
        >
          Jetzt zu den Workouts
        </button>
      </div>
    </section>

    <!-- Vorstellung der Hauptziele / Kernprinzipien -->
    <section class="container py-5">
      <h2 class="text-center mb-4">Unsere Ziele für eine barrierefreie Fitnessplattform</h2>
      <div class="row">
        <!-- Ziel 1: Navigation & Struktur -->
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">1. Klare Navigation & Struktur</h3>
              <p class="card-text">
                Logische Menüs und ARIA-Rollen für Screenreader. Einfach per Tastatur und Sprache zu
                bedienen, damit jede:r schnell zurechtfindet.
              </p>
            </div>
          </div>
        </div>
        <!-- Ziel 2: Visuelles Design -->
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">2. Visuelles Design</h3>
              <p class="card-text">
                Hohe Kontraste, anpassbare Schriftgrößen, responsives Layout – so bleibt alles gut
                lesbar und übersichtlich auf jedem Gerät.
              </p>
            </div>
          </div>
        </div>
        <!-- Ziel 3: Barrierefreiheit im Fokus -->
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">3. Barrierefreiheit im Fokus</h3>
              <p class="card-text">
                Videos mit Untertiteln, Gebärdensprache und Audiodeskriptionen. 
                Einfache Sprache, Screenreader- und Braille-Unterstützung für maximale Inklusion.
              </p>
            </div>
          </div>
        </div>
        <!-- Ziel 4: Personalisierung & Nutzerorientierung -->
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">4. Personalisierung & Nutzerorientierung</h3>
              <p class="card-text">
                Individuelle Trainingspläne: Ob Rollstuhl oder Sehbehinderung – jeder kann die
                Übungen an die eigenen Bedürfnisse anpassen.
              </p>
            </div>
          </div>
        </div>
        <!-- Ziel 5: Qualitätskontrolle & Support -->
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">5. Qualitätskontrolle & Support</h3>
              <p class="card-text">
                Regelmäßige WCAG-Tests, barrierefreier Kundendienst (z. B. Live-Chat mit
                Gebärdendolmetscher), FAQ und Videoanleitungen in einfacher Sprache.
              </p>
            </div>
          </div>
        </div>
        <!-- Ziel 6: Community & Aufklärung -->
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">6. Community & Aufklärung</h3>
              <p class="card-text">
                Vernetzung mit anderen, Fokus auf mentale Gesundheit und Inklusion. Tutorials zur
                Nutzung der Plattform und ihrer Funktionen.
              </p>
            </div>
          </div>
        </div>
        <!-- Ziel 7: Technische Tools & Umsetzung -->
        <div class="col-md-6 col-lg-4 mb-4 mx-auto">
          <div class="card h-100 shadow-sm" role="article">
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">7. Technische Tools & Umsetzung</h3>
              <p class="card-text">
                Prüfung mit Lighthouse & Co., Integration barrierefreundlicher Frameworks,
                kontinuierliche Optimierung für alle Geräte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call-to-Action / Community Hinweis -->
    <section class="bg-light py-5">
      <div class="container text-center">
        <h2 class="mb-3">Werde Teil unserer Community</h2>
        <p class="mb-4">
          Vernetze dich mit anderen, teile deine Erfolge und profitiere von gegenseitiger
          Motivation. Gemeinsam erreichen wir mehr!
        </p>
        <button class="btn btn-secondary btn-lg" @click="gotoCommunity">
          Zur Community
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const gotoWorkouts = () => {
  // Beispiel: Navigieren zur Workout-Übersicht
  router.push('/workouts')
}

const gotoCommunity = () => {
  // Beispiel: Navigieren zur Community-Seite oder zum Forum
  router.push('/community')
}
</script>

<style scoped>
.home-page {
  /* Du kannst hier globale oder seitenbezogene Styles definieren */
}

/* Beispiel: kleine Anpassung der Kartenhöhe */
.card {
  min-height: 200px;
}
</style>
