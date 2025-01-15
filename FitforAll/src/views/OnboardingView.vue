<template>
  <div class="container py-5">
    <h2 class="text-center mb-4">Wähle die betroffenen Muskelgruppen aus</h2>
    <p class="text-center text-muted">
      Klicke auf die Muskeln, die Probleme bereiten oder trainiert werden sollen:
    </p>

    <div class="row">
      <!-- Linke Spalte: Eingebettete SVG -->
      <div class="col-md-6">
        <div class="svg-container" v-html="svgContent" @click="handleSvgClick"></div>
      </div>

      <!-- Rechte Spalte: Deine weiteren Einstellungen -->
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h5>Zusätzliche Einstellungen</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="colorContrast" class="form-label">Farbschema</label>
              <select id="colorContrast" class="form-select" v-model="colorContrast">
                <option value="normal">Normal</option>
                <option value="high-contrast">Hoher Kontrast</option>
                <option value="dark">Dunkles Design</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="fontSize" class="form-label">Schriftgröße</label>
              <select id="fontSize" class="form-select" v-model="fontSize">
                <option value="normal">Normal</option>
                <option value="large">Groß</option>
                <option value="x-large">Extra Groß</option>
              </select>
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="screenreader" v-model="screenreader" />
              <label for="screenreader" class="form-check-label">
                Screenreader-Modus aktivieren
              </label>
            </div>
            <div class="mb-3">
              <label for="fullName" class="form-label">Voller Name</label>
              <input id="fullName" type="text" class="form-control" v-model="fullName" />
            </div>
            <div class="mb-3">
              <label for="username" class="form-label">Benutzername</label>
              <input id="username" type="text" class="form-control" v-model="username" />
            </div>
            <div class="mb-3">
              <label for="age" class="form-label">Alter</label>
              <input id="age" type="number" class="form-control" v-model.number="age" min="0" step="1" />
            </div>
            <div class="mb-3">
              <label for="weight" class="form-label">Gewicht (kg)</label>
              <input id="weight" type="number" class="form-control" v-model.number="weight" min="0" step="0.1" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-4">
      <button class="btn btn-primary" @click="savePreferences">Speichern</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";

const svgContent = ref("");
const selectedParts = ref([]);
const colorContrast = ref("normal");
const fontSize = ref("normal");
const screenreader = ref(false);

function toggleBodyPart(partId) {
  if (selectedParts.value.includes(partId)) {
    selectedParts.value = selectedParts.value.filter((id) => id !== partId);
  } else {
    selectedParts.value.push(partId);
  }
}

function handleSvgClick(event) {
  const target = event.target;
  if (target.classList.contains("s2")) { // Nur Elemente mit Klasse "s2" sind anklickbar
    const partId = target.id;
    toggleBodyPart(partId); // Markiere den Muskel
    target.classList.toggle("active"); // Ändere die Darstellung
  }
}

// Körperbereiche und zusätzliche Einstellungen speichern
async function savePreferences() {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    console.error("Benutzer nicht eingeloggt");
    return;
  }

  try {
    const { error } = await supabase
      .from("user_settings")
      .update({
        problem_muscle_groups: selectedParts.value,
        color_contrast: colorContrast.value,
        font_size: fontSize.value,
        screenreader: screenreader.value,
      })
      .eq("user_id", authData.user.id);

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
    } else {
      console.log("Daten erfolgreich gespeichert!");
    }
  } catch (err) {
    console.error("Fehler beim Speichern:", err.message);
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.value,
        username: username.value,
        age: age.value,
        weight: weight.value,
      })
      .eq("id", authData.user.id);

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
    } else {
      console.log("Daten erfolgreich gespeichert!");
    }
  } catch (err) {
    console.error("Fehler beim Speichern:", err.message);
  }

  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("has_finished_onboarding")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      console.error("Fehler beim Laden der Einstellungen:", error.message);
      return;
    }

    // Überprüfen, ob das Onboarding abgeschlossen ist
    if (data.has_finished_onboarding) {
      window.location.href = "/";
      return;
    }
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err.message);
  }
}

// Zusätzliche Eingabefelder
const fullName = ref("");
const username = ref("");
const age = ref(null);
const weight = ref(null);

// Beim Laden des Profils: Daten aus der Datenbank laden
onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    console.error("Benutzer nicht eingeloggt");
    return;
  }

  try {
    const response = await fetch("/assets/Muscle_Map.svg");
    svgContent.value = await response.text();
  } catch (error) {
    console.error("Fehler beim Laden der SVG:", error);
  }

  try {
    const { data: settinsData, error } = await supabase
      .from("user_settings")
      .select("problem_muscle_groups, color_contrast, font_size, screenreader")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      console.error("Fehler beim Laden der Einstellungen:", error.message);
      return;
    }

    selectedParts.value = settinsData.problem_muscle_groups || [];
    colorContrast.value = settinsData.color_contrast || "normal";
    fontSize.value = settinsData.font_size || "normal";
    screenreader.value = settinsData.screenreader || false;
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err.message);
  }

  try {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("full_name, username, age, weight")
      .eq("id", authData.user.id)
      .single();

    if (error) {
      console.error("Fehler beim Laden des Profils:", error.message);
      return;
    }

    // Initialisiere die Felder
    fullName.value = profileData.full_name || "";
    username.value = profileData.username || "";
    age.value = profileData.age || null;
    weight.value = profileData.weight || null;
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err.message);
  }

  try {
    // Updates für die Tabelle `profiles`
    console.log("Updating profiles with:", {
      full_name: fullName.value,
      username: username.value,
      age: age.value,
      weight: weight.value,
    });
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.value,
        username: username.value,
        age: age.value,
        weight: weight.value,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Fehler beim Aktualisieren des Profils:", profileError.message);
      throw profileError;
    }

    // Updates für die Tabelle `user_settings`
    console.log("Updating user_settings with:", {
      problem_muscle_groups: selectedParts.value,
      color_contrast: colorContrast.value,
      font_size: fontSize.value,
      screenreader: screenreader.value,
      has_finished_onboarding: false,
    });
    const { error: settingsError } = await supabase
      .from("user_settings")
      .update({
        problem_muscle_groups: selectedParts.value,
        color_contrast: colorContrast.value,
        font_size: fontSize.value,
        screenreader: screenreader.value,
        has_finished_onboarding: true,
      })
      .eq("user_id", authData.user.id);

    if (settingsError) {
      console.error("Fehler beim Aktualisieren der Einstellungen:", settingsError.message);
      throw settingsError;
    }

    console.log("Einstellungen erfolgreich gespeichert!");
  } catch (err) {
    console.error("Fehler beim Speichern der Daten:", err.message);
  }

});
</script>

<style scoped>
.svg-container {
  width: 100%;
  height: auto;
  max-width: 100%;
  overflow: hidden;
}

.muscle-area {
  fill: #cccccc;
  cursor: pointer;
  transition: fill 0.3s;
}

.muscle-area:hover {
  fill: #007bff;
}

.muscle-area.active {
  fill: #0056b3;
}
</style>