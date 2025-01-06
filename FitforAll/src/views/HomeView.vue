<template>
  <div class="container" aria-label="Hauptinhalt">
    <div class="row">
      <div class="col-12">
        <h1 class="mt-4">Willkommen in FitforAll</h1>

        <p class="lead">
          Dies ist ein barrierefreies Online-Gym, das alle Menschen einlädt, aktiv zu bleiben und
          ihre Fitness-Ziele zu verfolgen. Unsere Hauptziele sind:
        </p>

        <ul>
          <li>
            <strong>Klare Navigation und Struktur:</strong> 
            Logische Menüs, Screenreader-Unterstützung und einfache Tastaturbedienung.
          </li>
          <li>
            <strong>Visuelles Design:</strong>
            Hoher Kontrast, anpassbare Schriftgrößen und responsives Layout.
          </li>
          <li>
            <strong>Barrierefreiheit im Fokus:</strong>
            Videos mit Untertiteln, einfache Sprache, Kompatibilität mit Screenreadern.
          </li>
          <li>
            <strong>Personalisierung:</strong>
            Individuelle Trainingspläne für z. B. Rollstuhlfahrer oder Sehbehinderte.
          </li>
          <li>
            <strong>Community:</strong>
            Austausch mit anderen Nutzer:innen, inklusive Support und FAQ in einfacher Sprache.
          </li>
        </ul>

        <p>
          Viel Spaß beim Training! Bei Fragen steht unser barrierefreier Support jederzeit bereit.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  // Sicherheitshalber nochmal prüfen, ob User eingeloggt ist
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    router.push('/auth')
  }
})
</script>

<style scoped>
.container {
  margin-top: 40px;
}
</style>
