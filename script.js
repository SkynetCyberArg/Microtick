// Variables globales
let lotteryData = [];
let lotteryConfig = {
    minNumber: 1,
    maxNumber: 49,
    numbersToDraw: 6
};

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar listeners de eventos
    document.getElementById('lottery-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('lottery-type').addEventListener('change', handleLotteryTypeChange);
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);
});

// Manejar cambios en el tipo de lotería
function handleLotteryTypeChange() {
    const lotteryType = document.getElementById('lottery-type').value;
    const customSettings = document.getElementById('custom-settings');
    
    if (lotteryType === 'custom') {
        customSettings.classList.remove('d-none');
    } else {
        customSettings.classList.add('d-none');
        
        // Establecer configuraciones predeterminadas según el tipo de lotería
        if (lotteryType === 'standard') {
            lotteryConfig = {
                minNumber: 1,
                maxNumber: 49,
                numbersToDraw: 6
            };
        } else if (lotteryType === 'powerball') {
            lotteryConfig = {
                minNumber: 1,
                maxNumber: 69, // Números principales en Powerball
                numbersToDraw: 5,
                specialBall: true,
                specialMin: 1,
                specialMax: 26 // Powerball
            };
        }
        
        // Actualizar los campos de configuración personalizada
        document.getElementById('min-number').value = lotteryConfig.minNumber;
        document.getElementById('max-number').value = lotteryConfig.maxNumber;
        document.getElementById('numbers-to-draw').value = lotteryConfig.numbersToDraw;
    }
}

// Manejar la carga de archivos
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('historical-data').value = content;
    };
    reader.readAsText(file);
}

// Manejar el envío del formulario
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Mostrar indicador de carga
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('results').classList.add('d-none');
    
    // Obtener configuración de lotería
    updateLotteryConfig();
    
    // Obtener y procesar datos históricos
    const historicalDataText = document.getElementById('historical-data').value.trim();
    if (!historicalDataText) {
        showError('Por favor, ingresa datos históricos de lotería.');
        return;
    }
    
    // Procesar los datos
    processHistoricalData(historicalDataText);
    
    // Simular un pequeño retraso para mostrar el spinner (en una aplicación real, el análisis podría tomar tiempo)
    setTimeout(() => {
        // Generar predicciones
        const predictions = generatePredictions();
        
        // Mostrar resultados
        displayResults(predictions);
        
        // Ocultar indicador de carga
        document.getElementById('loading').classList.add('d-none');
        document.getElementById('results').classList.remove('d-none');
        
        // Mostrar estadísticas
        displayStatistics();
    }, 1500);
}

// Actualizar la configuración de lotería desde los campos del formulario
function updateLotteryConfig() {
    const lotteryType = document.getElementById('lottery-type').value;
    
    if (lotteryType === 'custom') {
        lotteryConfig = {
            minNumber: parseInt(document.getElementById('min-number').value) || 1,
            maxNumber: parseInt(document.getElementById('max-number').value) || 49,
            numbersToDraw: parseInt(document.getElementById('numbers-to-draw').value) || 6
        };
    }
}

// Procesar datos históricos de lotería
function processHistoricalData(dataText) {
    // Dividir el texto en líneas
    const lines = dataText.split('\n').filter(line => line.trim() !== '');
    
    // Procesar cada línea
    lotteryData = lines.map(line => {
        // Dividir la línea en números
        const numbers = line.trim().split(/\s+/).map(num => parseInt(num.trim()));
        return numbers;
    });
}

// Generar predicciones basadas en análisis estadístico
function generatePredictions() {
    // Objeto para almacenar resultados
    const results = {
        frequencyAnalysis: {},
        hotNumbers: [],
        coldNumbers: [],
        patterns: [],
        predictedNumbers: []
    };
    
    // 1. Análisis de frecuencia
    results.frequencyAnalysis = performFrequencyAnalysis();
    
    // 2. Identificar números "calientes" y "fríos"
    const sortedFrequencies = Object.entries(results.frequencyAnalysis)
        .sort((a, b) => b[1] - a[1]);
    
    // Números calientes (top 20% más frecuentes)
    const hotCount = Math.ceil(sortedFrequencies.length * 0.2);
    results.hotNumbers = sortedFrequencies.slice(0, hotCount).map(entry => parseInt(entry[0]));
    
    // Números fríos (20% menos frecuentes)
    results.coldNumbers = sortedFrequencies.slice(-hotCount).map(entry => parseInt(entry[0]));
    
    // 3. Análisis de patrones (pares y tríos comunes)
    results.patterns = findCommonPatterns();
    
    // 4. Generar predicción final
    // Estrategia: Combinar números calientes con algunos números de patrones comunes
    // y añadir algunos números aleatorios para diversidad
    
    // Comenzar con algunos números calientes
    let predictedSet = new Set();
    const hotNumbersToUse = Math.min(Math.ceil(lotteryConfig.numbersToDraw * 0.5), results.hotNumbers.length);
    
    for (let i = 0; i < hotNumbersToUse; i++) {
        if (i < results.hotNumbers.length) {
            predictedSet.add(results.hotNumbers[i]);
        }
    }
    
    // Añadir algunos números de patrones comunes
    if (results.patterns.length > 0) {
        const patternNumbersToUse = Math.min(Math.ceil(lotteryConfig.numbersToDraw * 0.3), 2);
        let patternCount = 0;
        
        for (const pattern of results.patterns) {
            if (patternCount >= patternNumbersToUse) break;
            
            for (const num of pattern.numbers) {
                predictedSet.add(num);
                if (predictedSet.size >= lotteryConfig.numbersToDraw) break;
            }
            
            patternCount++;
        }
    }
    
    // Completar con números aleatorios si es necesario
    while (predictedSet.size < lotteryConfig.numbersToDraw) {
        const randomNum = getRandomInt(lotteryConfig.minNumber, lotteryConfig.maxNumber);
        predictedSet.add(randomNum);
    }
    
    results.predictedNumbers = Array.from(predictedSet).sort((a, b) => a - b);
    
    return results;
}

// Realizar análisis de frecuencia
function performFrequencyAnalysis() {
    const frequency = {};
    
    // Inicializar contador para todos los números posibles
    for (let i = lotteryConfig.minNumber; i <= lotteryConfig.maxNumber; i++) {
        frequency[i] = 0;
    }
    
    // Contar frecuencia de cada número
    lotteryData.forEach(draw => {
        draw.forEach(number => {
            if (number >= lotteryConfig.minNumber && number <= lotteryConfig.maxNumber) {
                frequency[number]++;
            }
        });
    });
    
    return frequency;
}

// Encontrar patrones comunes (pares y tríos)
function findCommonPatterns() {
    const pairs = {};
    const trios = {};
    const patterns = [];
    
    // Analizar pares y tríos
    lotteryData.forEach(draw => {
        // Analizar pares
        for (let i = 0; i < draw.length; i++) {
            for (let j = i + 1; j < draw.length; j++) {
                const pair = [draw[i], draw[j]].sort((a, b) => a - b).join('-');
                pairs[pair] = (pairs[pair] || 0) + 1;
            }
        }
        
        // Analizar tríos
        for (let i = 0; i < draw.length; i++) {
            for (let j = i + 1; j < draw.length; j++) {
                for (let k = j + 1; k < draw.length; k++) {
                    const trio = [draw[i], draw[j], draw[k]].sort((a, b) => a - b).join('-');
                    trios[trio] = (trios[trio] || 0) + 1;
                }
            }
        }
    });
    
    // Convertir pares a array y ordenar por frecuencia
    const pairsArray = Object.entries(pairs)
        .map(([key, value]) => ({
            numbers: key.split('-').map(n => parseInt(n)),
            frequency: value,
            type: 'par'
        }))
        .sort((a, b) => b.frequency - a.frequency);
    
    // Convertir tríos a array y ordenar por frecuencia
    const triosArray = Object.entries(trios)
        .map(([key, value]) => ({
            numbers: key.split('-').map(n => parseInt(n)),
            frequency: value,
            type: 'trío'
        }))
        .sort((a, b) => b.frequency - a.frequency);
    
    // Tomar los 5 pares más comunes
    patterns.push(...pairsArray.slice(0, 5));
    
    // Tomar los 3 tríos más comunes
    patterns.push(...triosArray.slice(0, 3));
    
    return patterns;
}

// Mostrar resultados en la interfaz
function displayResults(predictions) {
    // 1. Mostrar números predichos
    const predictionContainer = document.getElementById('prediction-numbers');
    predictionContainer.innerHTML = '';
    
    predictions.predictedNumbers.forEach(number => {
        const numberElement = document.createElement('div');
        numberElement.className = 'lottery-number';
        
        // Añadir clase para números calientes o fríos
        if (predictions.hotNumbers.includes(number)) {
            numberElement.classList.add('hot');
        } else if (predictions.coldNumbers.includes(number)) {
            numberElement.classList.add('cold');
        }
        
        numberElement.textContent = number;
        predictionContainer.appendChild(numberElement);
    });
    
    // 2. Mostrar gráfico de frecuencia
    displayFrequencyChart(predictions.frequencyAnalysis);
    
    // 3. Mostrar patrones detectados
    displayPatterns(predictions.patterns);
}

// Mostrar gráfico de frecuencia
function displayFrequencyChart(frequencyData) {
    const ctx = document.getElementById('frequency-chart').getContext('2d');
    
    // Preparar datos para el gráfico
    const labels = Object.keys(frequencyData);
    const data = Object.values(frequencyData);
    
    // Crear gradiente de color
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(78, 115, 223, 0.8)');
    gradient.addColorStop(1, 'rgba(78, 115, 223, 0.1)');
    
    // Destruir gráfico existente si hay uno
    if (window.frequencyChart instanceof Chart) {
        window.frequencyChart.destroy();
    }
    
    // Crear nuevo gráfico
    window.frequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frecuencia',
                data: data,
                backgroundColor: gradient,
                borderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

// Mostrar patrones detectados
function displayPatterns(patterns) {
    const patternsList = document.getElementById('patterns-list');
    patternsList.innerHTML = '';
    
    if (patterns.length === 0) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = 'No se detectaron patrones significativos.';
        patternsList.appendChild(listItem);
        return;
    }
    
    patterns.forEach(pattern => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const patternText = document.createElement('span');
        patternText.innerHTML = `<strong>${pattern.type}:</strong> ${pattern.numbers.join(', ')}`;
        
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary rounded-pill';
        badge.textContent = `${pattern.frequency} veces`;
        
        listItem.appendChild(patternText);
        listItem.appendChild(badge);
        patternsList.appendChild(listItem);
    });
}

// Mostrar estadísticas generales
function displayStatistics() {
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = '';
    
    // Calcular estadísticas
    const totalDraws = lotteryData.length;
    const totalNumbersAnalyzed = totalDraws * lotteryConfig.numbersToDraw;
    const uniqueNumbers = new Set();
    
    lotteryData.forEach(draw => {
        draw.forEach(number => {
            uniqueNumbers.add(number);
        });
    });
    
    // Crear tarjetas de estadísticas
    const statsRow = document.createElement('div');
    statsRow.className = 'row';
    
    // Estadística 1: Total de sorteos analizados
    const stat1 = createStatCard('Sorteos Analizados', totalDraws);
    statsRow.appendChild(stat1);
    
    // Estadística 2: Total de números analizados
    const stat2 = createStatCard('Números Analizados', totalNumbersAnalyzed);
    statsRow.appendChild(stat2);
    
    // Estadística 3: Números únicos que han salido
    const stat3 = createStatCard('Números Únicos', uniqueNumbers.size);
    statsRow.appendChild(stat3);
    
    // Estadística 4: Cobertura de números posibles
    const possibleNumbers = lotteryConfig.maxNumber - lotteryConfig.minNumber + 1;
    const coverage = Math.round((uniqueNumbers.size / possibleNumbers) * 100);
    const stat4 = createStatCard('Cobertura', `${coverage}%`);
    statsRow.appendChild(stat4);
    
    statsContainer.appendChild(statsRow);
}

// Crear una tarjeta de estadística
function createStatCard(label, value) {
    const col = document.createElement('div');
    col.className = 'col-md-3 col-sm-6';
    
    const card = document.createElement('div');
    card.className = 'stat-card text-center';
    
    const valueElement = document.createElement('div');
    valueElement.className = 'stat-value';
    valueElement.textContent = value;
    
    const labelElement = document.createElement('div');
    labelElement.className = 'stat-label';
    labelElement.textContent = label;
    
    card.appendChild(valueElement);
    card.appendChild(labelElement);
    col.appendChild(card);
    
    return col;
}

// Función de utilidad para generar números aleatorios
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mostrar mensaje de error
function showError(message) {
    document.getElementById('loading').classList.add('d-none');
    alert(message);
}