<template>
  <div class="home-page" aria-labelledby="pageTitle">
    <!-- Hero-Bereich -->
    <section class="hero-section text-center py-5">
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

    <!-- Karten: Videos, Trainingsplan, Ernährungsplan -->
    <!-- Hier habe ich das Padding oben reduziert und der Überschrift zusätzlich mt-0 hinzugefügt -->
    <section class="container pt-3 pb-5">
      <h2 class="text-center mb-4 mt-0">Unsere Funktionen</h2>
      <!-- Erhöhte Gutter-Abstände mit g-5 -->
      <div class="row g-5">
        <!-- Videos-Karte -->
        <div class="col-md-6 col-lg-4">
          <div
            class="card h-100 shadow-sm card-enlarged"
            role="article"
            @click="gotoPage('/videos')"
            style="cursor: pointer;"
          >
            <img src="/assets/videos.jpg" class="card-img-top" alt="Videos" />
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">Videos</h3>
              <p class="card-text">
                Entdecke unsere Trainingsvideos mit professionellen Coaches, die dir bei jedem Schritt helfen.
              </p>
            </div>
          </div>
        </div>
        <!-- Trainingsplan-Karte -->
        <div class="col-md-6 col-lg-4">
          <div
            class="card h-100 shadow-sm card-enlarged"
            role="article"
            @click="gotoPage('/training-plans')"
            style="cursor: pointer;"
          >
            <img src="/assets/trainingsplan.jpg" class="card-img-top" alt="Trainingsplan" />
            <div class="card-body">
              <h3 class="card-title fs-5 fw-bold">Trainingsplan</h3>
              <p class="card-text">
                Erstelle deinen individuellen Trainingsplan, der perfekt auf deine Bedürfnisse abgestimmt ist.
              </p>
            </div>
          </div>
        </div>
        <!-- Ernährungsplan-Karte (leicht extra verbreitert) -->
        <div class="col-md-6 col-lg-4 ernaehrungsplan-card">
          <div
            class="card h-100 shadow-sm card-enlarged"
            role="article"
            @click="gotoPage('/ernaehrungsplan')"
            style="cursor: pointer;"
          >
            <img src="/assets/ernaehrungsplan.jpg" class="card-img-top" alt="Ernährungsplan" />
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

    <!-- Call-to-Action: Community -->
    <section class="community-section py-5">
      <div class="container text-center">
        <h2 class="mb-3">Werde Teil unserer Community</h2>
        <p class="mb-4">
          Vernetze dich mit anderen, teile deine Erfolge und profitiere von gegenseitiger Motivation.
          Gemeinsam erreichen wir mehr!
        </p>
        <button class="btn btn-secondary btn-lg" @click="gotoCommunity">
          Zur Community
        </button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  methods: {
    gotoWorkouts() {
      this.$router.push('/workouts');
    },
    gotoCommunity() {
      this.$router.push('/community');
    },
    gotoPage(path) {
      this.$router.push(path);
    },
  },
};
</script>

<style>
.home-page {
  min-height: 100vh;
  background-color: inherit; /* Erbt das globale Farbschema */
}

.hero-section {
  background-color: var(--primary-color, #007bff); /* Standard-Blau */
  color: white;
}

.card {
  min-height: 500px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}
.card-img-top {
  height: 300px;
  object-fit: cover;
}

/* Zusätzliche Klasse für leichte Vergrößerung der Karten (nur horizontale Anpassung wird hier nicht verändert) */
.card-enlarged {
  transform: scale(1.05);
}

/* Extra Anpassung für die Ernährungsplan-Karte – falls gewünscht */
.ernaehrungsplan-card .card {
  transform: scale(1.07);
}
</style>
