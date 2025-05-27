/**
 * Script para el visor de PDF del Manual MikroTik
 * Este script maneja la generación, visualización y navegación del PDF
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const viewManualBtn = document.getElementById('view-manual');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const welcomeScreen = document.getElementById('welcome-screen');
    const pdfViewerContainer = document.getElementById('pdf-viewer-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const pdfViewer = document.getElementById('pdf-viewer');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const backToWelcomeBtn = document.getElementById('back-to-welcome');
    
    // Variables para el manejo del PDF
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.0;
    let pdfData = null;
    
    /**
     * Genera el PDF a partir del contenido HTML del manual
     * @returns {Promise} Promesa que se resuelve con la URI de datos del PDF
     */
    function generatePDF() {
        // Mostrar pantalla de carga
        loadingOverlay.classList.remove('d-none');
        
        // Cargar el contenido del manual
        return fetch('mikrotik-manual.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el manual: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                // Crear un elemento temporal para el contenido
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = html;
                
                // Cargar las secciones adicionales
                const sectionPromises = [];
                const sectionPlaceholders = tempContainer.querySelectorAll('[id$="-pcc"], [id$="-ecmp"], [id$="-failover"], [id$="-uso"], [id$="-troubleshooting"], [id$="-recursos"]');
                
                sectionPlaceholders.forEach(placeholder => {
                    const sectionId = placeholder.id;
                    const sectionFile = `mikrotik-${sectionId}-section.html`;
                    
                    const promise = fetch(sectionFile)
                        .then(response => response.text())
                        .then(sectionHtml => {
                            placeholder.innerHTML = sectionHtml;
                        })
                        .catch(error => {
                            console.warn(`No se pudo cargar la sección ${sectionId}:`, error);
                        });
                    
                    sectionPromises.push(promise);
                });
                
                // Esperar a que todas las secciones se carguen
                return Promise.all(sectionPromises).then(() => tempContainer);
            })
            .then(contentElement => {
                // Configuración para html2pdf
                const opt = {
                    margin: [15, 15, 15, 15],
                    filename: 'Manual_MikroTik_Balanceo_Carga.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };
                
                // Generar el PDF
                return html2pdf().set(opt).from(contentElement).outputPdf('datauristring');
            })
            .catch(error => {
                console.error('Error al generar el PDF:', error);
                alert(`Ocurrió un error al generar el PDF: ${error.message}. Por favor, inténtalo de nuevo.`);
                loadingOverlay.classList.add('d-none');
                throw error;
            });
    }
    
    /**
     * Inicializa el visor de PDF con la URI de datos proporcionada
     * @param {string} pdfDataUri - URI de datos del PDF
     */
    function initPdfViewer(pdfDataUri) {
        // Guardar los datos del PDF para uso posterior
        pdfData = pdfDataUri;
        
        // Configurar PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        
        // Cargar el PDF
        const loadingTask = pdfjsLib.getDocument(pdfDataUri);
        loadingTask.promise
            .then(function(pdf) {
                pdfDoc = pdf;
                pageIndicator.textContent = `Página ${pageNum} de ${pdf.numPages}`;
                
                // Habilitar botones de navegación
                prevPageBtn.disabled = pageNum <= 1;
                nextPageBtn.disabled = pageNum >= pdf.numPages;
                
                // Renderizar la primera página
                renderPage(pageNum);
            })
            .catch(function(error) {
                console.error('Error al cargar el PDF:', error);
                alert(`Error al cargar el PDF: ${error.message}. Por favor, inténtalo de nuevo.`);
                loadingOverlay.classList.add('d-none');
            });
    }
    
    /**
     * Renderiza una página específica del PDF
     * @param {number} num - Número de página a renderizar
     */
    function renderPage(num) {
        pageRendering = true;
        
        // Obtener la página
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Renderizar la página en el canvas
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);
            renderTask.promise.then(function() {
                pageRendering = false;
                
                // Actualizar el visor con la imagen del canvas
                const imgData = canvas.toDataURL('image/png');
                pdfViewer.src = imgData;
                
                // Ocultar la pantalla de carga
                loadingOverlay.classList.add('d-none');
                
                // Actualizar estado de los botones de navegación
                prevPageBtn.disabled = pageNum <= 1;
                nextPageBtn.disabled = pageNum >= pdfDoc.numPages;
                
                // Procesar cualquier página pendiente
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
        
        // Actualizar el indicador de página
        pageIndicator.textContent = `Página ${num} de ${pdfDoc.numPages}`;
    }
    
    /**
     * Pone en cola la renderización de una página
     * @param {number} num - Número de página a renderizar
     */
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
    
    /**
     * Navega a la página anterior
     */
    function onPrevPage() {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    }
    
    /**
     * Navega a la página siguiente
     */
    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }
    
    /**
     * Aumenta el zoom del PDF
     */
    function onZoomIn() {
        scale += 0.1;
        queueRenderPage(pageNum);
    }
    
    /**
     * Disminuye el zoom del PDF
     */
    function onZoomOut() {
        if (scale <= 0.2) {
            return;
        }
        scale -= 0.1;
        queueRenderPage(pageNum);
    }
    
    /**
     * Descarga el PDF generado
     */
    function downloadPDF() {
        if (pdfData) {
            // Si ya tenemos el PDF generado, descargarlo directamente
            const link = document.createElement('a');
            link.href = pdfData;
            link.download = 'Manual_MikroTik_Balanceo_Carga.pdf';
            link.click();
        } else {
            // Si no tenemos el PDF, generarlo y descargarlo
            loadingOverlay.classList.remove('d-none');
            
            generatePDF()
                .then(pdfDataUri => {
                    pdfData = pdfDataUri;
                    const link = document.createElement('a');
                    link.href = pdfDataUri;
                    link.download = 'Manual_MikroTik_Balanceo_Carga.pdf';
                    link.click();
                    loadingOverlay.classList.add('d-none');
                })
                .catch(error => {
                    console.error('Error al descargar el PDF:', error);
                    loadingOverlay.classList.add('d-none');
                });
        }
    }
    
    // Event listeners
    viewManualBtn.addEventListener('click', function() {
        welcomeScreen.classList.add('d-none');
        pdfViewerContainer.classList.remove('d-none');
        
        if (pdfData) {
            // Si ya tenemos el PDF generado, mostrarlo directamente
            pdfViewer.src = pdfData;
            loadingOverlay.classList.add('d-none');
        } else {
            // Si no tenemos el PDF, generarlo
            generatePDF()
                .then(pdfDataUri => {
                    pdfViewer.src = pdfDataUri;
                    initPdfViewer(pdfDataUri);
                })
                .catch(() => {
                    // En caso de error, volver a la pantalla de bienvenida
                    pdfViewerContainer.classList.add('d-none');
                    welcomeScreen.classList.remove('d-none');
                });
        }
    });
    
    downloadPdfBtn.addEventListener('click', downloadPDF);
    prevPageBtn.addEventListener('click', onPrevPage);
    nextPageBtn.addEventListener('click', onNextPage);
    zoomInBtn.addEventListener('click', onZoomIn);
    zoomOutBtn.addEventListener('click', onZoomOut);
    
    backToWelcomeBtn.addEventListener('click', function() {
        pdfViewerContainer.classList.add('d-none');
        welcomeScreen.classList.remove('d-none');
    });
    
    // Manejar eventos de teclado para navegación
    document.addEventListener('keydown', function(e) {
        if (pdfViewerContainer.classList.contains('d-none')) {
            return; // No hacer nada si el visor no está visible
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                onPrevPage();
                break;
            case 'ArrowRight':
                onNextPage();
                break;
            case '+':
            case '=':
                onZoomIn();
                break;
            case '-':
                onZoomOut();
                break;
            case 'Escape':
                pdfViewerContainer.classList.add('d-none');
                welcomeScreen.classList.remove('d-none');
                break;
        }
    });
});