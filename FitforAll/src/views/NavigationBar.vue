<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">FitforAll</a>
        <select class="form-select ms-auto" @change="onThemeChange($event)">
          <option value="normal">Normal</option>
          <option value="high-contrast">Hoher Kontrast</option>
          <option value="dark">Dunkles Design</option>
        </select>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'NavigationBar',
    methods: {
      onThemeChange(event) {
        this.$emit('toggleTheme', event.target.value); // Gibt das ausgewählte Schema zurück
      },
    },
  };
  </script>
  
  <style scoped>
  .navbar {
    padding: 1rem;
  }
  </style>
  