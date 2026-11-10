TECHCOST BUSINESS SIMULATOR — CLOUDSCALE INC.

ESTRUCTURA DE CARPETAS
TechCost_Business_Simulator/
|-- index.html
|-- css/
|   `-- styles.css
|-- js/
|   `-- app.js
|-- assets/
|   `-- (reservada para imágenes o logotipos, si luego se agregan)
`-- README.txt

PARA EJECUTARLO EN VISUAL STUDIO CODE
1. Descarga y descomprime el ZIP.
2. Abre Visual Studio Code.
3. Selecciona Archivo > Abrir carpeta.
4. Elige la carpeta TechCost_Business_Simulator (no abras solamente index.html).
5. En el explorador de VS Code, abre index.html.
6. Puedes abrirlo directamente en el navegador con doble clic en index.html.
   Recomendado: instala la extensión Live Server, haz clic derecho en index.html
   y selecciona "Open with Live Server".
7. No requiere XAMPP, PHP, MySQL, Node.js ni npm: es un sitio estático HTML/CSS/JavaScript.

ARCHIVOS
- index.html: estructura y contenido de las páginas/secciones.
- css/styles.css: diseño visual, colores, distribución y adaptación móvil.
- js/app.js: cálculos económicos, navegación, tabla, gráficos y descarga CSV.
- assets/: carpeta para imágenes o logotipo (actualmente no necesita archivos).

FUNCIONES INCLUIDAS
- Resumen general del caso.
- Simulador de corto plazo con volumen Q y precio P editables.
- CFT, CVT, CT, CFM, CVM, CTM, CMg, ingresos y resultado.
- Regla de cierre temporal, operación con pérdidas y punto de equilibrio.
- Interpolación lineal de CVT entre puntos observados, identificada como estimada.
- Tabla de datos y exportación CSV.
- Comparación de plantas de largo plazo y cálculo CTLP = CMeLP × Q.
- Propuesta conceptual Kubernetes + microservicios.
- Metodología, fórmulas, supuestos y límites.

SUPUESTOS DEL MODELO IMPLEMENTADO
- CFT = $12,000 mensuales.
- CVT observado: L=0,Q=0,$0; L=1,Q=10,$3,000; L=2,Q=25,$6,000;
  L=3,Q=45,$9,000; L=4,Q=60,$12,000; L=5,Q=70,$15,000; L=6,Q=75,$18,000.
- Q se expresa en miles de transacciones.
- Corto plazo: Q entre 0 y 75; no extrapola fuera de ese intervalo.
- Planta pequeña: Q < 40, CMeLP=$400.
- Planta mediana: 40 <= Q <= 90, CMeLP=$280.
- Planta grande: Q > 90, CMeLP=$350.
- CTLP = CMeLP × Q.

IMPORTANTE ANTES DE ENTREGAR
Compara estos datos con el documento oficial de la actividad. Si el documento asigna
otros valores, rangos, nombres o requisitos, deben prevalecer los del documento.
Comprueba los cálculos con el docente o con los datos originales, revisa las referencias
bibliográficas y toma capturas reales de cada sección funcionando para el informe.
