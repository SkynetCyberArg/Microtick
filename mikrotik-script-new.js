// Script moderno para el Manual de MikroTik

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar animaciones de entrada
    initFadeInAnimations();
    
    // Inicializar navegación suave
    initSmoothScrolling();
    
    // Inicializar efectos de tarjetas
    initCardEffects();
    
    // Inicializar botón de PDF
    initPdfGenerator();
    
    // Inicializar efectos de diagrama
    initDiagramEffects();
    
    // Inicializar observador de scroll
    initScrollObserver();
});

// Animaciones de entrada
function initFadeInAnimations() {
    const elements = document.querySelectorAll('section, .card');
    elements.forEach(element => {
        element.classList.add('fade-in');
    });
}

// Navegación suave
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Actualizar URL
                history.pushState(null, null, targetId);
                
                // Añadir efecto de resaltado
                targetElement.classList.add('highlight');
                setTimeout(() => {
                    targetElement.classList.remove('highlight');
                }, 1500);
            }
        });
    });
}

// Efectos de tarjetas
function initCardEffects() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Generador de PDF mejorado
function initPdfGenerator() {
    const generatePdfButton = document.getElementById('generate-pdf');
    if (generatePdfButton) {
        generatePdfButton.addEventListener('click', function() {
            // Mostrar loader
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando PDF...';
            this.disabled = true;
            
            // Configuración mejorada para html2pdf
            const opt = {
                margin: 15,
                filename: 'Manual_MikroTik_Balanceo_Carga.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    dpi: 192,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            
            // Generar PDF con mejor calidad
            generatePDFWithProgress(opt, this);
        });
    }
}

// Función para generar PDF con barra de progreso
async function generatePDFWithProgress(opt, button) {
    try {
        const element = document.body.cloneNode(true);
        
        // Limpiar elementos innecesarios
        element.querySelectorAll('#generate-pdf, footer').forEach(el => {
            el.remove();
        });
        
        await html2pdf().set(opt).from(element).save();
        
        // Restaurar botón
        button.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Generar PDF';
        button.disabled = false;
        
        // Mostrar mensaje de éxito
        showNotification('¡PDF generado con éxito!', 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        button.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Generar PDF';
        button.disabled = false;
        showNotification('Error al generar el PDF', 'error');
    }
}

// Efectos de diagramas
function initDiagramEffects() {
    const diagrams = document.querySelectorAll('.diagram-container img');
    diagrams.forEach(diagram => {
        diagram.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        diagram.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Observador de scroll para animaciones
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('section, .card').forEach(element => {
        observer.observe(element);
    });
}

// Función para mostrar notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}