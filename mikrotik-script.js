// Script para el Manual de Configuraciones MikroTik

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el botón para generar PDF
    const generatePdfButton = document.getElementById('generate-pdf');
    if (generatePdfButton) {
        generatePdfButton.addEventListener('click', generatePDF);
    }

    // Inicializar tooltips de Bootstrap si existen
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (tooltipTriggerList.length > 0) {
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Añadir comportamiento de scroll suave para los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
                
                // Actualizar la URL sin recargar la página
                history.pushState(null, null, targetId);
            }
        });
    });
});

/**
 * Genera un archivo PDF a partir del contenido del manual
 */
function generatePDF() {
    // Mostrar un mensaje de carga
    const generateButton = document.getElementById('generate-pdf');
    const originalButtonText = generateButton.innerHTML;
    generateButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generando PDF...';
    generateButton.disabled = true;

    // Configuración para html2pdf
    const element = document.body;
    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'Manual_MikroTik_Balanceo_Carga.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Crear una copia del elemento para modificarlo sin afectar la página original
    const elementClone = element.cloneNode(true);
    
    // Ocultar elementos que no queremos en el PDF
    const elementsToRemove = elementClone.querySelectorAll('#generate-pdf, footer');
    elementsToRemove.forEach(el => {
        el.style.display = 'none';
    });

    // Generar el PDF
    html2pdf()
        .set(opt)
        .from(elementClone)
        .save()
        .then(() => {
            // Restaurar el botón cuando termine
            generateButton.innerHTML = originalButtonText;
            generateButton.disabled = false;
            
            // Mostrar mensaje de éxito
            alert('¡PDF generado con éxito! La descarga debería comenzar automáticamente.');
        })
        .catch(error => {
            console.error('Error al generar el PDF:', error);
            generateButton.innerHTML = originalButtonText;
            generateButton.disabled = false;
            alert('Ocurrió un error al generar el PDF. Por favor, inténtalo de nuevo.');
        });
}

/**
 * Función para mostrar/ocultar secciones de código
 * @param {string} id - ID del elemento a mostrar/ocultar
 */
function toggleCodeSection(id) {
    const codeSection = document.getElementById(id);
    if (codeSection) {
        if (codeSection.style.display === 'none' || codeSection.style.display === '') {
            codeSection.style.display = 'block';
        } else {
            codeSection.style.display = 'none';
        }
    }
}