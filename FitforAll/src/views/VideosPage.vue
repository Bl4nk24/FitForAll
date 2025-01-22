<template>
  <PageLayout>
    <template #default>
      <div class="text-center mb-4">
        <h2>Deine Workout-Bibliothek</h2>
        <p>Finde die besten Workouts für dich!</p>
      </div>
      <div v-if="loading" class="text-center">
        <p>Lade Workouts...</p>
      </div>
      <div v-else>
        <div v-if="filteredWorkouts.length === 0" class="alert alert-info">
          Keine passenden Workouts gefunden.
        </div>
        <div class="row">
          <div class="col" v-for="workout in filteredWorkouts" :key="workout.id">
            <div class="card">
              <img :src="getYoutubeThumbnail(workout.video_url)" class="card-img-top" alt="Thumbnail" />
              <div class="card-body">
                <h5 class="card-title">{{ workout.name }}</h5>
                <p>{{ excerpt(workout.description, 80) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script setup>
import PageLayout from './PageLayout.vue';
import { ref } from 'vue';

const loading = ref(false);
const filteredWorkouts = ref([]);

function getYoutubeThumbnail(url) {
  return url || '/fallback-thumbnail.jpg';
}

function excerpt(text, length) {
  return text.length > length ? text.slice(0, length) + '...' : text;
}
</script>
