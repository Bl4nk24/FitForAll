<template>
  <PageLayout>
    <template #default>
      <div class="trainingsplan-content text-center">
        <h2 class="mb-4 fw-bold">Erstelle deinen eigenen Plan</h2>
        <p class="mb-4">
          Wähle deine bevorzugten Übungen aus und passe den Plan an deine Bedürfnisse an.
        </p>
        <button class="btn btn-success btn-lg">Plan erstellen</button>
      </div>
    </template>
  </PageLayout>
</template>

<script setup>
import PageLayout from './PageLayout.vue';
</script>

<style scoped>
.trainingsplan-content {
  max-width: 700px;
  margin: 0 auto;
}
</style>
