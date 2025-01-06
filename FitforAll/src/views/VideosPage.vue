<template>
    <div class="page videos-page">
      <section class="bg-primary text-white text-center py-5">
        <div class="container">
          <h1 class="display-4 fw-bold">Videos</h1>
          <p class="lead">Professionelle Trainingsvideos für dein Fitnessziel</p>
        </div>
      </section>
      <section class="container py-5">
        <h2 class="text-center mb-4">Entdecke unsere Video-Bibliothek</h2>
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <img src="/assets/videos.jpg" class="card-img-top" alt="Video Thumbnail">
              <div class="card-body">
                <h5 class="card-title">Workout für Anfänger</h5>
                <p class="card-text">Einsteigerfreundliche Übungen für einen erfolgreichen Start.</p>
                <button class="btn btn-primary">Video ansehen</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <style scoped>
  .videos-page .card-img-top {
    height: 200px;
    object-fit: cover;
  }
  </style>
  