# 🗓️ CalendAI — Gamified Fast-Action Calendar

CalendAI es un **Calendario y Diario Gamificado** diseñado para la velocidad extrema. A diferencia de las aplicaciones de calendario tradicionales, CalendAI elimina la fricción de los selectores de fecha complejos mediante un **Magic Input** inteligente impulsado por Procesamiento de Lenguaje Natural (NLP).

![Premium Design](https://img.shields.io/badge/Design-Bento_Box-blueviolet)
![Tech Stack](https://img.shields.io/badge/Stack-React_Native_%7C_Zustand_%7C_Expo-blue)
![NLP](https://img.shields.io/badge/NLP-Spanish-green)

---

## ✨ Características Principales

### 🪄 Magic Input (NLP en Español)
Agrega eventos simplemente escribiendo. No pierdas tiempo seleccionando horas o días en menús.
- *"Reunión con el equipo mañana a las 10am"*
- *"Gimnasio el lunes a las 6 de la tarde"*
- *"Comprar café en 2 horas"*

### 🐾 Mascota Interactiva (Pet Companion)
Una mascota que vive en tu dashboard y reacciona a tus hábitos.
- **Estado de Ánimo:** Se pone feliz cuando completas tareas y se entristece si tienes pendientes atrasados.
- **Feedback Visual:** Animaciones fluidas que hacen la gestión de tiempo algo divertido.

### 🍱 Diseño Bento Box
Interfaz moderna, oscura y minimalista inspirada en la estética "Bento" para una organización visual clara y sin estrés.

### 📓 Diario de Reflexión
Espacio dedicado para notas rápidas al final del día integrado directamente en tu línea de tiempo.

### 🔌 Offline First
Tus datos se guardan localmente usando **AsyncStorage**. La app carga instantáneamente incluso sin conexión.

---

## 🛠️ Stack Tecnológico

- **Framework:** React Native con Expo (SDK 53/54).
- **Estado:** [Zustand](https://github.com/pmndrs/zustand) con persistencia.
- **NLP:** [chrono-node](https://github.com/wanasit/chrono) (módulo especializado en español).
- **Estilos:** Vanilla StyleSheet con sistema de diseño centralizado.
- **Iconos:** Emojis nativos para máxima compatibilidad y ligereza.

---

## 🚀 Cómo Empezar

### Requisitos Previos
1. Instalar [Node.js](https://nodejs.org/).
2. Instalar la app **Expo Go** en tu dispositivo móvil (disponible en App Store y Play Store).

### Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/Saasxmes1/Saas1-MobileFront.git
   cd Saas1-MobileFront
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el proyecto:
   ```bash
   npx expo start --clear
   ```

4. Escanea el código QR con la cámara de tu móvil para abrirlo en **Expo Go**.

---

## 📱 Guía de Uso

1. **Pantalla de Inicio:** Escribe cualquier tarea en el campo de texto superior. Identificaremos automáticamente la fecha y hora.
2. **Interacción:** Toca el check `✓` para completar una tarea o la `✕` para eliminarla.
3. **Diario:** Desliza a la pestaña del centro para escribir tus reflexiones del día.
4. **Configuración:** Personaliza la mascota o tu meta de notificaciones en la última pestaña.

---

## 🛡️ Compatibilidad
Este proyecto está optimizado específicamente para **Expo Go**, utilizando la API estándar de `Animated` de React Native para asegurar que las animaciones funcionen en cualquier dispositivo sin necesidad de configuraciones nativas complejas.

---
Creado con ❤️ para una gestión de tiempo sin fricciones.
