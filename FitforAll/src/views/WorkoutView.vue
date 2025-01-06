<template>
  <div class="container mt-5">
    <h2 class="mb-4">Dein personalisierter Trainingsplan</h2>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Lade Workouts...</span>
      </div>
    </div>

    <div v-else>
      <p v-if="filteredWorkouts.length === 0" class="text-muted">
        Keine passenden Workouts gefunden. Bitte passe deine Einstellungen oder Workouts an.
      </p>

      <div class="row row-cols-1 row-cols-md-2 g-4" v-if="filteredWorkouts.length > 0">
        <div class="col" v-for="workout in filteredWorkouts" :key="workout.id">
          <div class="card h-100">
            <!-- YouTube-Einbettung -->
            <div class="ratio ratio-16x9">
              <iframe
                :src="getYouTubeEmbedUrl(workout.video_url)"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ workout.name }}</h5>
              <p class="card-text">{{ workout.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const userLimitations = ref([]);
const allWorkouts = ref([]);
const filteredWorkouts = ref([]);

onMounted(async () => {
  // 1) Prüfen, ob User eingeloggt ist
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    // Falls kein User => Weiterleitung zum Login
    router.push('/auth');
    return;
  }

  // 2) user_settings abrufen (physische Einschränkungen)
  const { data: settingsData, error: settingsError } = await supabase
    .from('user_settings')
    .select('physical_limitations')
    .eq('user_id', authData.user.id)
    .single();

  if (settingsError) {
    console.error('Fehler beim Laden der Einstellungen:', settingsError.message);
    loading.value = false;
    return;
  }

  userLimitations.value = settingsData?.physical_limitations || [];
  console.log('User Limitations:', userLimitations.value); // Debugging

  // 3) Workouts aus DB laden
  const { data: workoutsData, error: workoutsError } = await supabase
    .from('workouts')
    .select('*');

  if (workoutsError) {
    console.error('Fehler beim Laden der Workouts:', workoutsError.message);
    loading.value = false;
    return;
  }

  allWorkouts.value = workoutsData || [];
  console.log('All Workouts:', allWorkouts.value); // Debugging

  // 4) Filter anwenden: Zeige nur Workouts mit exakt denselben Einschränkungen
  filteredWorkouts.value = allWorkouts.value.filter((workout) => {
    if (!workout.limitations || workout.limitations.length === 0) {
      // Workout hat keine Einschränkungen, also geeignet
      return true;
    }
    const hasSameLimitations =
      workout.limitations.length === userLimitations.value.length &&
      workout.limitations.every((lim) => userLimitations.value.includes(lim));
    return hasSameLimitations;
  });

  console.log('Filtered Workouts:', filteredWorkouts.value); // Debugging
  loading.value = false;
});

/**
 * Konvertiert eine YouTube-URL in eine Einbettungs-URL
 */
function getYouTubeEmbedUrl(url) {
  // Extrahiere die Video-ID aus der YouTube-URL
  const videoId = url.split('v=')[1]?.split('&')[0];
  return `https://www.youtube.com/embed/${videoId}`;
}
</script>

<style scoped>
.ratio {
  background-color: #000; /* dunkler Hintergrund hinter dem Video */
}
</style>
