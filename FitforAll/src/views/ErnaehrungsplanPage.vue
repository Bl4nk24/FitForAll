<template>
  <PageLayout>
    <template #default>
      <div class="ernaehrungsplan-content text-center">
        <h2 class="mb-4 fw-bold">Plane deine Mahlzeiten</h2>
        <p class="mb-4">
          Wähle aus verschiedenen Rezepten und erstelle deinen personalisierten Ernährungsplan.
        </p>
        <button class="btn btn-warning btn-lg">Rezepte durchsuchen</button>
      </div>
    </template>
  </PageLayout>
</template>

<script setup>
import PageLayout from './PageLayout.vue';
</script>

<style scoped>
.ernaehrungsplan-content {
  max-width: 700px;
  margin: 0 auto;
}
</style>
