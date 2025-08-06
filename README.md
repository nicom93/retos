# Betting Tracker - Seguimiento de Desafíos de Apuestas

Una aplicación web para registrar y hacer seguimiento de desafíos de apuestas paso a paso, con cálculo automático de ganancias y estadísticas detalladas.

## Características

- 📊 **Dashboard en tiempo real** con estadísticas del día
- 🎯 **Tracker de desafíos** para registrar apuestas paso a paso
- 📈 **Cálculo automático** de ganancias basado en cuotas
- 📅 **Historial completo** con filtros por fecha
- 💰 **Seguimiento de totales** en cada paso del desafío
- 🔥 **Base de datos Firebase** para persistencia de datos
- 📱 **Interfaz responsive** optimizada para móviles

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Firebase Firestore
- **Hosting**: Netlify
- **Routing**: React Router DOM

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd betting-tracker
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Ve a Configuración del proyecto > Configuración de SDK
5. Copia la configuración de la web app

### 4. Actualizar configuración de Firebase

Edita el archivo `src/firebase/config.ts` y reemplaza los valores con tu configuración:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 5. Configurar reglas de Firestore

En Firebase Console > Firestore Database > Reglas, usa estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /challenges/{document} {
      allow read, write: if true;
    }
  }
}
```

## Desarrollo Local

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Construcción para Producción

```bash
npm run build
```

## Despliegue en Netlify

### Opción 1: Despliegue Automático (Recomendado)

1. Conecta tu repositorio de GitHub a Netlify
2. Configura las variables de entorno en Netlify:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

### Opción 2: Despliegue Manual

1. Construye la aplicación:
   ```bash
   npm run build
   ```

2. Sube la carpeta `build` a Netlify

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── ChallengeTracker.tsx # Tracker de desafíos
│   ├── History.tsx     # Historial de desafíos
│   └── Navbar.tsx      # Navegación
├── services/           # Servicios de Firebase
│   └── firebaseService.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── firebase/           # Configuración de Firebase
│   └── config.ts
└── App.tsx            # Componente principal
```

## Uso de la Aplicación

### 1. Dashboard
- Vista general de las estadísticas del día
- Resumen de desafíos recientes
- Acceso rápido a crear nuevos desafíos

### 2. Tracker
- Crear nuevos desafíos
- Registrar apuestas paso a paso
- Ver el progreso en tiempo real
- Cálculo automático de ganancias

### 3. Historial
- Ver todos los desafíos pasados
- Filtrar por fecha
- Estadísticas detalladas de cada desafío

## Funcionalidades Principales

### Registro de Desafíos
- Cada desafío se registra con fecha automática
- Seguimiento de múltiples pasos por desafío
- Estado automático (en progreso, completado, fallido)

### Cálculo de Ganancias
- Cálculo automático basado en monto y cuota
- Seguimiento del total acumulado
- Visualización de ganancias potenciales

### Estadísticas
- Total de desafíos por día
- Tasa de éxito
- Beneficio total
- Historial detallado

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.
