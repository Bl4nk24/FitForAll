<template>
    <div class="community-page container my-5" aria-labelledby="communityTitle">
      <h1 id="communityTitle" class="text-center mb-4">Community</h1>
      <p class="lead text-center mb-4">
        Teile deine Erfahrungen, stelle Fragen und unterstütze andere Mitglieder in unserer barrierefreien Community.
      </p>
  
      <!-- Formular für einen neuen Beitrag -->
      <section class="new-post mb-4">
        <h2 class="h5 mb-3">Neuer Beitrag</h2>
        <form @submit.prevent="submitPost">
          <div class="mb-3">
            <label for="postContent" class="form-label">Beitrag verfassen</label>
            <textarea
              id="postContent"
              class="form-control"
              v-model="newPostContent"
              rows="4"
              placeholder="Schreibe deinen Beitrag hier..."
              aria-required="true"
            ></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Posten</button>
        </form>
      </section>
  
      <!-- Liste der Beiträge -->
      <section class="posts">
        <h2 class="h5 mb-3">Aktuelle Beiträge</h2>
        <div v-if="posts.length === 0" class="alert alert-info" role="alert">
          Noch keine Beiträge. Sei der Erste!
        </div>
        <div v-else>
          <div v-for="post in posts" :key="post.id" class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">{{ post.author }}</h5>
              <p class="card-text">{{ post.content }}</p>
              <p class="card-text">
                <small class="text-muted">{{ formatDate(post.created_at) }}</small>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  
  const posts = ref([]);
  const newPostContent = ref('');
  
  // Fügt einen neuen Beitrag zur Liste hinzu
  function submitPost() {
    if (!newPostContent.value.trim()) return;
    
    const newPost = {
      id: uuidv4(),
      author: "Anonym", // Hier könnte der Name des eingeloggten Nutzers stehen
      content: newPostContent.value,
      created_at: new Date().toISOString()
    };
  
    posts.value.unshift(newPost);
    newPostContent.value = '';
  }
  
  // Datum formatieren
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  </script>
  
  <style scoped>
  .community-page {
  }
  
  /* Formular für neue Beiträge */
  .new-post {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }
  
  /* Beitragskarten */
  .posts .card {
    border-radius: 0.5rem;
  }
  </style>
  