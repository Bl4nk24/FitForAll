<template>
  <div class="container py-5">
    <h2 class="text-center mb-4">Wähle die betroffenen Muskelgruppen aus</h2>
    <p class="text-center text-muted">
      Klicke auf die Muskeln, die Probleme bereiten oder trainiert werden sollen:
    </p>

    <div class="row">
      <!-- Linke Spalte: SVG mit Muskeln -->
      <div class="col-md-6">
        <div class="svg-container">
          <!-- SVG mit v-bind:class für Hover- und Active-States -->
          <svg
            viewBox="0 0 500 1000"
            xmlns="http://www.w3.org/2000/svg"
            class="muscle-svg"
          >
            <!-- Vorderseite (Beispiel) -->
            <!-- Brust -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('brust') }"
              d="M 200 150 C 210 130, 290 130, 300 150 L 300 250 L 200 250 Z"
              @click="toggleBodyPart('brust')"
            ></path>
            <!-- Bauch (Abs) -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('bauch') }"
              d="M 220 250 L 280 250 L 280 400 L 220 400 Z"
              @click="toggleBodyPart('bauch')"
            ></path>
            <!-- Bizeps links -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('bizeps_links') }"
              d="M 150 180 C 140 210, 140 250, 150 280 L 170 280 L 170 180 Z"
              @click="toggleBodyPart('bizeps_links')"
            ></path>
            <!-- Bizeps rechts -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('bizeps_rechts') }"
              d="M 330 180 C 340 210, 340 250, 330 280 L 310 280 L 310 180 Z"
              @click="toggleBodyPart('bizeps_rechts')"
            ></path>
            <!-- Oberschenkel links -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('oberschenkel_links') }"
              d="M 210 420 L 180 560 L 220 560 L 250 420 Z"
              @click="toggleBodyPart('oberschenkel_links')"
            ></path>
            <!-- Oberschenkel rechts -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('oberschenkel_rechts') }"
              d="M 290 420 L 320 560 L 280 560 L 250 420 Z"
              @click="toggleBodyPart('oberschenkel_rechts')"
            ></path>

            <!-- Hinterseite (Beispiel) – du könntest entweder eine zweite SVG oder denselben
                 SVG-Container weiter unten benutzen. Hier nur ein kurzer Ausschnitt für die Rückenmuskeln. -->
            <!-- Rücken oben -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('ruecken_oben') }"
              d="M 200 150 C 210 130, 290 130, 300 150 L 300 250 L 200 250 Z"
              transform="translate(0, 450)" 
              @click="toggleBodyPart('ruecken_oben')"
            ></path>
            <!-- Rücken unten -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('ruecken_unten') }"
              d="M 200 250 L 300 250 L 300 380 L 200 380 Z"
              transform="translate(0, 450)"
              @click="toggleBodyPart('ruecken_unten')"
            ></path>
            <!-- Po (Gluteus) -->
            <path
              class="muscle-area"
              :class="{ active: selectedParts.includes('po') }"
              d="M 220 380 L 280 380 L 280 480 L 220 480 Z"
              transform="translate(0, 450)"
              @click="toggleBodyPart('po')"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Rechte Spalte: Deine weiteren Einstellungen und Eingabefelder (unverändert) -->
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h5>Zusätzliche Einstellungen</h5>
          </div>
          <div class="card-body">
            <!-- Farbschema -->
            <div class="mb-3">
              <label for="colorContrast" class="form-label">Farbschema</label>
              <select id="colorContrast" class="form-select" v-model="colorContrast">
                <option value="normal">Normal</option>
                <option value="high-contrast">Hoher Kontrast</option>
                <option value="dark">Dunkles Design</option>
              </select>
            </div>

            <!-- Schriftgröße -->
            <div class="mb-3">
              <label for="fontSize" class="form-label">Schriftgröße</label>
              <select id="fontSize" class="form-select" v-model="fontSize">
                <option value="normal">Normal</option>
                <option value="large">Groß</option>
                <option value="x-large">Extra Groß</option>
              </select>
            </div>

            <!-- Screenreader -->
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="screenreader"
                v-model="screenreader"
              />
              <label for="screenreader" class="form-check-label">
                Screenreader-Modus aktivieren
              </label>
            </div>
            
            <!-- Zusätzliche Fragen -->
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
              <input
                id="age"
                type="number"
                class="form-control"
                v-model.number="age"
                min="0"
                step="1"
                @input="validateAge"
              />
            </div>

            <div class="mb-3">
              <label for="weight" class="form-label">Gewicht (kg)</label>
              <input
                id="weight"
                type="number"
                class="form-control"
                v-model.number="weight"
                min="0"
                step="0.1"
                @input="validateWeight"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Speichern-Button -->
    <div class="text-center mt-4">
      <button class="btn btn-primary" @click="savePreferences">Speichern</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";

// Reaktive Daten
const selectedParts = ref([]);
const colorContrast = ref("normal");
const fontSize = ref("normal");
const screenreader = ref(false);

// Körperteil hinzufügen/entfernen
function toggleBodyPart(part) {
  if (selectedParts.value.includes(part)) {
    selectedParts.value = selectedParts.value.filter((p) => p !== part);
  } else {
    selectedParts.value.push(part);
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
/* Container für das SVG, damit es nicht zu groß wird */
.svg-container {
  max-width: 300px;
  margin: 0 auto;
}

.muscle-svg {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.muscle-area {
  fill: #ccc;
  stroke: #888;
  stroke-width: 2;
  cursor: pointer;
  transition: fill 0.3s, stroke 0.3s;
}

.muscle-area:hover {
  fill: #007bff; /* Hover-Farbe */
  stroke: #0056b3;
}

.muscle-area.active {
  fill: #0056b3; /* Wenn ausgewählt */
  stroke: #003f7f;
}
</style>