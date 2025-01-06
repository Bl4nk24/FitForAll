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
        <!-- Zielkarten -->
        <div class="col-md-6 col-lg-4 mb-4" v-for="(card, index) in goalCards" :key="index">
          <div class="card h-100 shadow-sm" role="article">
            <img :src="card.imgSrc" class="card-img-top" :alt="card.altText" />
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">{{ card.title }}</h3>
              <p class="card-text">{{ card.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Zusätzliche Karten: Videos, Trainingsplan, Ernährungsplan -->
    <section class="container py-5">
      <h2 class="text-center mb-4">Weitere Funktionen</h2>
      <div class="row">
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <img src="/assets/videos.jpg" class="card-img-top" alt="Videos" />
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">Videos</h3>
              <p class="card-text">
                Entdecke unsere Trainingsvideos mit professionellen Coaches, die dir bei jedem Schritt helfen.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <img src="\assets\trainingsplan.jpg" class="card-img-top" alt="Trainingsplan" />
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">Trainingsplan</h3>
              <p class="card-text">
                Erstelle deinen individuellen Trainingsplan, der perfekt auf deine Bedürfnisse abgestimmt ist.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm" role="article">
            <img src="\assets\ernaehrungsplan.jpg" class="card-img-top" alt="Ernährungsplan" />
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">Ernährungsplan</h3>
              <p class="card-text">
                Plane deine Mahlzeiten mit unserem Ernährungsplan, um deine Fitnessziele zu erreichen.
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
import { useRouter } from 'vue-router';

const router = useRouter();

const gotoWorkouts = () => {
  router.push('/workouts');
};

const gotoCommunity = () => {
  router.push('/community');
};

const goalCards = [
  {
    imgSrc: '/assets/navigation.jpg',
    altText: 'Navigation und Struktur',
    title: 'Klare Navigation & Struktur',
    description:
      'Logische Menüs und ARIA-Rollen für Screenreader. Einfach per Tastatur und Sprache zu bedienen, damit jede:r schnell zurechtfindet.',
  },
  {
    imgSrc: '/assets/design.jpg',
    altText: 'Visuelles Design',
    title: 'Visuelles Design',
    description:
      'Hohe Kontraste, anpassbare Schriftgrößen, responsives Layout – so bleibt alles gut lesbar und übersichtlich auf jedem Gerät.',
  },
  {
    imgSrc: '/assets/barrierefreiheit.jpg',
    altText: 'Barrierefreiheit',
    title: 'Barrierefreiheit im Fokus',
    description:
      'Videos mit Untertiteln, Gebärdensprache und Audiodeskriptionen. Einfache Sprache, Screenreader- und Braille-Unterstützung für maximale Inklusion.',
  },
];
</script>

<style scoped>
.home-page {
  /* Globale oder seitenbezogene Styles */
}

.card {
  min-height: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style>
