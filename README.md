# Tracker de Retos de Apuestas

Sistema simple y funcional para hacer seguimiento de retos de apuestas deportivas desde una cuenta de Telegram.

## 🎯 Características

### **Funcionalidades Principales:**
- ✅ **Tabla resumen de retos** con todos los campos clave
- ✅ **Cálculos automáticos** de rendimiento y ganancias
- ✅ **Filtros por fecha y resultado**
- ✅ **Panel de estadísticas** en tiempo real
- ✅ **Análisis automático** con preguntas clave
- ✅ **Almacenamiento local** (localStorage)
- ✅ **Interfaz minimalista** y rápida

### **Campos del Sistema:**
1. **Fecha del reto** - Campo obligatorio tipo date
2. **Monto invertido en el Paso 1** - Número decimal/entero
3. **Cantidad total de pasos alcanzados** - Número entero
4. **Monto máximo alcanzado** - Valor máximo logrado en el reto
5. **Resultado final** - Dropdown: completo, fallido, abandonado, en curso
6. **Observaciones** - Texto libre opcional

### **Cálculos Automáticos:**
- **% de ganancia** = `(monto máximo / monto invertido) * 100`
- **Rendimiento neto** = `monto máximo - monto invertido`
- **Estadísticas generales** (totales, promedios, etc.)

## 🚀 Instalación y Uso

### **Instalación:**
```bash
# Clonar el repositorio
git clone <repository-url>
cd betting-tracker

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Construir para producción
npm run build
```

### **Uso:**
1. **Agregar Reto**: Haz clic en "Agregar Reto" y completa los campos obligatorios
2. **Filtrar**: Usa los filtros de fecha y resultado para ver datos específicos
3. **Editar**: Haz clic en "Editar" en cualquier fila para modificar datos
4. **Eliminar**: Usa el botón "Eliminar" para quitar retos
5. **Analizar**: Revisa la sección de análisis para insights automáticos

## 📊 Panel de Estadísticas

El sistema muestra automáticamente:
- **Total de retos** cargados
- **Promedio de pasos** por reto
- **Inversión total** acumulada
- **Ganancia máxima total** alcanzada
- **Rendimiento promedio** en porcentaje

## 🔍 Filtros Disponibles

- **Por fecha**: Selecciona una fecha específica
- **Por resultado**: Filtra por completo, fallido, abandonado, en curso
- **Combinados**: Los filtros funcionan en conjunto

## 📈 Análisis Automático

El sistema responde automáticamente a estas preguntas:
- ¿Cuál fue el reto con mayor ganancia máxima?
- ¿Qué porcentaje de retos superó los 5 pasos?
- ¿Cuál es el rendimiento promedio de todos los retos?
- ¿Cuál fue la ganancia total neta?
- ¿Cuál es la tasa de éxito?

## 💾 Almacenamiento

- **LocalStorage**: Todos los datos se guardan en el navegador
- **Sin backend**: No requiere servidor ni base de datos externa
- **Persistencia**: Los datos se mantienen entre sesiones
- **Exportación**: Los datos están disponibles en el localStorage del navegador

## 🎨 Tecnologías

- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **localStorage** para persistencia
- **Cálculos automáticos** en tiempo real

## 📱 Diseño

- **Desktop-first**: Optimizado para pantallas grandes
- **Responsive**: Funciona en tablets y móviles
- **Minimalista**: Interfaz limpia y rápida
- **Intuitivo**: Fácil de usar sin instrucciones complejas

## 🔧 Personalización

### **Cambiar Moneda:**
En `src/components/Dashboard.tsx`, línea de `formatCurrency`:
```typescript
currency: 'USD' // Cambiar a 'EUR', 'ARS', etc.
```

### **Agregar Campos:**
1. Modificar `src/types/index.ts`
2. Actualizar `src/services/storageService.ts`
3. Agregar campos en el formulario de `src/components/Dashboard.tsx`

## 📝 Ejemplo de Uso

### **Escenario Típico:**
1. **Reto del 15/01/2024**:
   - Inversión inicial: $1,000
   - Pasos alcanzados: 8
   - Máximo alcanzado: $3,500
   - Resultado: Completo
   - Observaciones: "Excelente estrategia de escalado"

2. **Cálculos automáticos**:
   - Rendimiento: +250%
   - Ganancia neta: $2,500
   - Contribuye a estadísticas generales

## 🚨 Notas Importantes

- **Datos locales**: Los datos se guardan solo en tu navegador
- **Sin sincronización**: No hay backup automático
- **Exportación manual**: Puedes exportar desde DevTools > Application > Local Storage
- **Sin autenticación**: Sistema de uso personal

## 🆘 Soporte

Para problemas o mejoras:
1. Revisar la consola del navegador para errores
2. Verificar que localStorage esté habilitado
3. Limpiar localStorage si hay datos corruptos

---

**Desarrollado para seguimiento personal de retos de apuestas deportivas.**
