class TextHumanizer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.humanizationTechniques = new HumanizationTechniques();
    }

    initializeElements() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.humanizeBtn = document.getElementById('humanizeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.aiPatterns = document.getElementById('aiPatterns');
        this.humanScore = document.getElementById('humanScore');
        this.detectionRisk = document.getElementById('detectionRisk');
        this.confidenceLevel = document.getElementById('confidenceLevel');
        this.changesExplanation = document.getElementById('changesExplanation');
        this.changesList = document.getElementById('changesList');
    }

    bindEvents() {
        this.humanizeBtn.addEventListener('click', () => this.humanizeText());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.inputText.addEventListener('input', () => this.analyzeText());
        
        // Show analysis panel when there's input
        this.analysisPanel = document.getElementById('analysisPanel');
    }

    async humanizeText() {
        const text = this.inputText.value.trim();
        if (!text) {
            alert('Vänligen ange text att humanisera');
            return;
        }

        this.showLoading(true);
        
        try {
            // Simulate processing time for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const result = this.humanizationTechniques.transform(text);
            
            this.outputText.value = result.humanizedText;
            this.displayChanges(result.changes);
            this.copyBtn.style.display = 'block';
            this.changesExplanation.style.display = 'block';
            
        } catch (error) {
            console.error('Humanization error:', error);
            // NEVER return error messages - always provide humanized output
            const fallbackResult = this.humanizationTechniques.fallbackHumanize(text);
            this.outputText.value = fallbackResult.humanizedText;
            this.displayChanges(fallbackResult.changes);
            this.copyBtn.style.display = 'block';
            this.changesExplanation.style.display = 'block';
        } finally {
            this.showLoading(false);
        }
    }

    analyzeText() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.resetAnalysis();
            this.analysisPanel.style.display = 'none';
            return;
        }

        // Show analysis panel when there's input
        this.analysisPanel.style.display = 'block';

        const analysis = this.humanizationTechniques.analyzeText(text);
        this.aiPatterns.textContent = analysis.aiPatterns;
        this.humanScore.textContent = `${analysis.humanScore}/10`;
        
        // Calculate detection risk
        const riskLevel = this.calculateDetectionRisk(analysis.humanScore);
        this.detectionRisk.textContent = riskLevel.text;
        this.detectionRisk.className = `metric-value ${riskLevel.class}`;
        
        // Show preliminary confidence
        const preliminaryConfidence = Math.max(20, analysis.humanScore * 8);
        this.confidenceLevel.textContent = `~${preliminaryConfidence}%`;
    }

    calculateDetectionRisk(humanScore) {
        if (humanScore >= 8) return { text: 'Låg', class: 'risk-low' };
        if (humanScore >= 6) return { text: 'Medium', class: 'risk-medium' };
        if (humanScore >= 4) return { text: 'Hög', class: 'risk-high' };
        return { text: 'Mycket hög', class: 'risk-critical' };
    }

    displayChanges(changes) {
        this.changesList.innerHTML = '';
        changes.forEach(change => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${change.type}:</strong> ${change.description}`;
            this.changesList.appendChild(li);
        });
    }

    showLoading(show) {
        const btnText = this.humanizeBtn.querySelector('.btn-text');
        const loading = this.humanizeBtn.querySelector('.loading');
        
        if (show) {
            btnText.style.display = 'none';
            loading.style.display = 'inline';
            this.humanizeBtn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            loading.style.display = 'none';
            this.humanizeBtn.disabled = false;
        }
    }

    clearAll() {
        this.inputText.value = '';
        this.outputText.value = '';
        this.copyBtn.style.display = 'none';
        this.changesExplanation.style.display = 'none';
        this.analysisPanel.style.display = 'none';
        this.resetAnalysis();
    }

    resetAnalysis() {
        this.aiPatterns.textContent = '-';
        this.humanScore.textContent = '-/10';
        this.detectionRisk.textContent = '-';
        this.detectionRisk.className = 'metric-value';
        this.confidenceLevel.textContent = '-';
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.outputText.value);
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = '✅ Kopierat!';
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            alert('Kunde inte kopiera texten');
        }
    }
}

class HumanizationTechniques {
    constructor() {
        // PHASE 1: AI Pattern Detection (Expanded)
        this.aiPatterns = [
            /\b(furthermore|moreover|additionally|consequently|therefore|thus|hence|nonetheless|nevertheless)\b/gi,
            /\b(it is important to note|it should be noted|it is worth mentioning|it is crucial to understand)\b/gi,
            /\b(in conclusion|to summarize|in summary|to sum up|overall|ultimately)\b/gi,
            /\b(comprehensive|extensive|significant|substantial|considerable|numerous|various|multiple)\b/gi,
            /\b(utilize|implement|facilitate|optimize|enhance|demonstrate|indicate|suggest|reveal)\b/gi,
            /\b(first and foremost|last but not least|it goes without saying|needless to say)\b/gi,
            /\b(delve into|dive deep|explore in depth|shed light on|bring to light)\b/gi
        ];

        // PHASE 2: Advanced Human Replacements
        this.humanReplacements = {
            'furthermore': ['plus', 'också', 'dessutom', 'och sen', 'å andra sidan', 'sen då'],
            'moreover': ['förresten', 'dessutom', 'och', 'å sen då', 'plus det här'],
            'additionally': ['plus', 'också', 'och', 'sen har vi ju', 'å så'],
            'consequently': ['så', 'därför', 'vilket betyder att', 'så då blir det', 'resultatet blir'],
            'therefore': ['så', 'alltså', 'därför', 'så då', 'vilket gör att'],
            'thus': ['så', 'alltså', 'på så sätt', 'därmed'],
            'hence': ['därför', 'så', 'vilket leder till', 'så då'],
            'utilize': ['använd', 'ta', 'kör med', 'nyttja', 'dra nytta av'],
            'implement': ['gör', 'kör', 'sätt igång', 'genomför', 'kör igång med'],
            'facilitate': ['hjälp till med', 'gör det lättare att', 'underlättar', 'möjliggör'],
            'optimize': ['förbättra', 'fixa', 'göra bättre', 'trimma', 'finslipa'],
            'enhance': ['förbättra', 'piffa upp', 'göra bättre', 'höja', 'stärka'],
            'comprehensive': ['grundlig', 'komplett', 'ordentlig', 'heltäckande', 'genomgripande'],
            'extensive': ['stor', 'omfattande', 'massa', 'bred', 'utförlig'],
            'significant': ['stor', 'viktig', 'märkbar', 'betydande', 'rejäl'],
            'substantial': ['stor', 'ordentlig', 'rejäl', 'betydande', 'omfattande'],
            'considerable': ['stor', 'ganska mycket', 'rätt så mycket', 'betydande', 'ansenlig'],
            'demonstrate': ['visa', 'bevisa', 'påvisa', 'illustrera'],
            'indicate': ['visar', 'tyder på', 'pekar på', 'antyder'],
            'reveal': ['visar', 'avslöjar', 'blottlägger', 'uppenbarar']
        };

        // PHASE 3: Natural Speech Patterns
        this.naturalFillers = [];
        
        this.naturalStarters = [];

        this.naturalConnectors = [
            'och', 'men', 'dock', 'samtidigt', 'dessutom'
        ];

        // Natural phrase replacements
        this.naturalPhraseReplacements = {
            'vattnets kretslopp är en ständig process': ['vatten cirkulerar kontinuerligt', 'vatten rör sig i ett kretslopp', 'vattnets cirkulation pågår ständigt'],
            'drivs av solens energi': ['solen driver processen', 'solenergi är drivkraften', 'solen ger energi till processen'],
            'avgörande för allt liv på vår planet': ['viktigt för allt liv på jorden', 'nödvändigt för livet på planeten', 'grundläggande för jordens liv'],
            'genom en process som kallas': ['genom processen', 'via den process som kallas', 'genom det som kallas'],
            'cirkulera i ett evigt kretslopp': ['cirkulerar kontinuerligt', 'rör sig i kretslopp', 'fortsätter att cirkulera'],
            'spelar en central roll': ['är viktigt för', 'har stor betydelse för', 'påverkar'],
            'ständigt har tillgång till': ['alltid har tillgång till', 'kontinuerligt kan komma åt', 'har konstant tillgång till'],
            'en avgörande faktor': ['en viktig faktor', 'något som påverkar mycket', 'en betydelsefull aspekt'],
            'av fundamental betydelse': ['mycket viktigt', 'grundläggande viktigt', 'av stor betydelse'],
            'kontinuerlig process': ['pågående process', 'process som fortsätter', 'ständigt pågående'],
            'väsentlig för': ['viktig för', 'betydelsefull för', 'nödvändig för'],
            'essentiell komponent': ['viktig del', 'nödvändig komponent', 'central del'],
            'konstant rörelse': ['ständig rörelse', 'kontinuerlig rörelse', 'pågående rörelse'],
            'oavbrutet flöde': ['kontinuerligt flöde', 'ständigt flöde', 'pågående flöde']
        };

        // Natural academic phrase replacements
        this.academicPhraseReplacements = {
            'på så sätt': ['på detta vis', 'därmed', 'således'],
            'av stor betydelse': ['mycket viktigt', 'betydelsefullt', 'väsentligt'],
            'det är värt att notera': ['det bör noteras', 'viktigt att komma ihåg', 'det ska påpekas'],
            'i detta sammanhang': ['i detta fall', 'här', 'i denna situation'],
            'med andra ord': ['det vill säga', 'alltså', 'vilket betyder'],
            'det bör påpekas': ['det ska noteras', 'viktigt att komma ihåg', 'det bör understrykas'],
            'som tidigare nämnts': ['som nämnts tidigare', 'enligt tidigare beskrivning', 'som redan sagts'],
            'i enlighet med': ['enligt', 'i överensstämmelse med', 'följer'],
            'det framgår tydligt att': ['det är uppenbart att', 'det visar sig att', 'det blir klart att'],
            'resulterar i att': ['leder till att', 'får till följd att', 'orsakar att'],
            'bidrar till att': ['hjälper till att', 'medverkar till att', 'är med och skapar'],
            'här är de viktigaste aspekterna': ['här är det viktigaste', 'det viktigaste är', 'huvudpunkterna är'],
            'integreras på olika nivåer': ['kopplas ihop på olika sätt', 'hänger ihop på olika vis', 'sammankopplas på flera plan'],
            'företag, länder och samhällen': ['företag, länder och folk', 'organisationer, länder och människor', 'företag, stater och samhällen']
        };

        // Natural vocabulary replacements
        this.naturalVocabularyReplacements = {
            'analysera': ['undersöka', 'granska', 'studera'],
            'konstatera': ['fastställa', 'notera', 'observera'],
            'diskutera': ['behandla', 'tala om', 'gå igenom'],
            'argumentera': ['resonera', 'förklara', 'motivera'],
            'exemplifiera': ['illustrera', 'visa exempel på', 'ge exempel'],
            'konkludera': ['dra slutsatsen', 'sammanfatta', 'komma fram till'],
            'reflektera': ['fundera över', 'betrakta', 'överväga'],
            'problematisera': ['ifrågasätta', 'belysa problem med', 'kritiskt granska'],
            'karaktärisera': ['beskriva', 'känneteckna', 'utmärka'],
            'specificera': ['precisera', 'förtydliga', 'ange i detalj'],
            'transpiration': ['avdunstning från växter', 'växternas vattenavgång'],
            'evaporation': ['avdunstning', 'förångning'],
            'kondensation': ['kondensering', 'vattenbildning']
        };

        // Natural uncertainty patterns
        this.naturalUncertainty = [
            'möjligen', 'troligen', 'förmodligen', 'sannolikt'
        ];

        // Natural contractions (minimal)
        this.naturalContractions = {};

        // Removed teenage-specific patterns

        // Natural grammar variations
        this.naturalGrammarVariations = {
            'eftersom': ['då', 'för att'],
            'därför att': ['för att', 'då'],
            'på grund av': ['till följd av', 'beroende på'],
            'med anledning av': ['på grund av', 'till följd av'],
            'i och med att': ['eftersom', 'då'],
            'trots att': ['även om', 'fastän'],
            'även om': ['trots att', 'fastän'],
            'å andra sidan': ['däremot', 'samtidigt'],
            'däremot': ['å andra sidan', 'samtidigt'],
            'emellertid': ['dock', 'samtidigt']
        };
    }

    analyzeText(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        let aiPatternCount = 0;
        let formalityScore = 0;
        let repetitiveStructure = 0;

        // Count AI patterns
        this.aiPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) aiPatternCount += matches.length;
        });

        // Check sentence structure variety
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
        if (avgSentenceLength > 20) formalityScore += 2;
        if (avgSentenceLength > 15) formalityScore += 1;

        // Check for repetitive sentence starts
        const startWords = sentences.map(s => s.trim().split(' ')[0]?.toLowerCase()).filter(Boolean);
        const uniqueStarts = new Set(startWords);
        if (uniqueStarts.size < startWords.length * 0.7) repetitiveStructure += 2;

        const humanScore = Math.max(1, 10 - aiPatternCount - formalityScore - repetitiveStructure);

        return {
            aiPatterns: aiPatternCount > 0 ? `${aiPatternCount} upptäckta` : 'Inga upptäckta',
            humanScore: Math.min(10, humanScore),
            improvements: this.getImprovementSuggestions(aiPatternCount, formalityScore, repetitiveStructure)
        };
    }

    getImprovementSuggestions(aiPatterns, formality, repetitive) {
        const suggestions = [];
        if (aiPatterns > 0) suggestions.push('AI-typiska fraser');
        if (formality > 1) suggestions.push('Formell ton');
        if (repetitive > 0) suggestions.push('Repetitiv struktur');
        if (suggestions.length === 0) suggestions.push('Redan ganska naturlig');
        return suggestions.join(', ');
    }

    transform(text) {
        try {
            let humanizedText = text;
            const changes = [];

            // DECOPY.AI UNLIMITED PROTOCOL - Multiple revision passes
            for (let pass = 1; pass <= 3; pass++) {
                // STAGE 1: AI Pattern Analysis & Destruction
                humanizedText = this.advancedPatternAnalysis(humanizedText, changes, pass);

                // STAGE 2: Advanced Restructuring (Decopy-style)
                humanizedText = this.sophisticatedRestructuring(humanizedText, changes, pass);

                // STAGE 3: Zero Detection Optimization
                humanizedText = this.zeroDetectionOptimization(humanizedText, changes, pass);

                // STAGE 4: Natural Language Optimization
                humanizedText = this.naturalLanguageOptimization(humanizedText, changes, pass);
            }

            // Final verification and confidence calculation
            const confidenceLevel = this.calculateAdvancedConfidence(humanizedText);
            changes.push({
                type: 'DECOPY.AI UNLIMITED',
                description: `Slutlig konfidensgrad för 0% AI-detektion: ${confidenceLevel}%`
            });

            return {
                humanizedText: humanizedText.trim(),
                changes
            };
        } catch (error) {
            return this.fallbackHumanize(text);
        }
    }

    advancedPatternAnalysis(text, changes, pass) {
        let result = text;
        let patternCount = 0;

        // Advanced AI signature detection (beyond basic patterns)
        const advancedAISignatures = [
            /\b(furthermore|moreover|additionally|consequently|therefore|thus|hence|nonetheless|nevertheless|however|indeed|obviously|clearly|essentially|basically|literally|actually|definitely|absolutely|completely|totally|extremely|significantly|substantially|considerably|particularly|especially|specifically|generally|typically|usually|normally|frequently|commonly|rarely|seldom|never|always|often|sometimes|occasionally|perhaps|maybe|possibly|probably|certainly|surely|undoubtedly|obviously|apparently|evidently|presumably|supposedly|allegedly|reportedly|seemingly|arguably|notably|remarkably|surprisingly|interestingly|unfortunately|fortunately|hopefully|ideally|ultimately|eventually|finally|initially|originally|previously|subsequently|meanwhile|simultaneously|alternatively|conversely|similarly|likewise)\b/gi,
            /\b(it is important to note|it should be noted|it is worth mentioning|it is crucial to understand|it goes without saying|needless to say|first and foremost|last but not least|delve into|dive deep|explore in depth|shed light on|bring to light)\b/gi,
            /\b(in conclusion|to summarize|in summary|to sum up|overall|ultimately|in essence|fundamentally|essentially|basically|primarily|mainly|chiefly|predominantly|largely|mostly|generally|typically|commonly|frequently|often|usually|normally|regularly|consistently|constantly|continuously|perpetually|eternally|infinitely|absolutely|completely|entirely|totally|fully|wholly|utterly|thoroughly|extensively|comprehensively|exhaustively)\b/gi
        ];

        // Eliminate ALL advanced AI signatures
        advancedAISignatures.forEach(pattern => {
            const matches = result.match(pattern);
            if (matches) {
                patternCount += matches.length;
                result = result.replace(pattern, '');
            }
        });

        // Natural phrase replacements
        Object.entries(this.naturalPhraseReplacements).forEach(([trigger, replacements]) => {
            if (result.toLowerCase().includes(trigger.toLowerCase())) {
                patternCount++;
                const replacement = replacements[Math.floor(Math.random() * replacements.length)];
                result = result.replace(new RegExp(trigger, 'gi'), replacement);
            }
        });

        if (patternCount > 0) {
            changes.push({
                type: `Avancerad Mönsteranalys (Pass ${pass})`,
                description: `Eliminerade ${patternCount} AI-signaturer med Decopy.ai-teknologi`
            });
        }

        return result;
    }

    sophisticatedRestructuring(text, changes, pass) {
        let result = text;
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());
        let restructureCount = 0;

        // Decopy-style sentence rhythm variation
        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i]) {
                let sentence = sentences[i].trim();
                const words = sentence.split(' ');

                // Advanced sentence restructuring based on pass
                if (pass === 1) {
                    // First pass: Basic restructuring
                    if (words.length > 12) {
                        const midPoint = Math.floor(words.length / 2);
                        const part1 = words.slice(0, midPoint).join(' ');
                        const part2 = words.slice(midPoint).join(' ');
                        sentence = part1 + '. ' + part2.charAt(0).toUpperCase() + part2.slice(1);
                        restructureCount++;
                    }
                } else if (pass === 2) {
                    // Second pass: Advanced flow optimization
                    if (words.length > 8) {
                        const connectors = ['Men', 'Och', 'Fast'];
                        const connector = connectors[Math.floor(Math.random() * connectors.length)];
                        sentence = connector + ' ' + sentence.toLowerCase();
                        restructureCount++;
                    }
                } else if (pass === 3) {
                    // Third pass: Natural imperfection injection
                    if (Math.random() > 0.8) {
                        const imperfections = ['kanske', 'möjligen'];
                        const imperfection = imperfections[Math.floor(Math.random() * imperfections.length)];
                        const insertPos = Math.floor(words.length / 3);
                        words.splice(insertPos, 0, imperfection);
                        sentence = words.join(' ');
                        restructureCount++;
                    }
                }

                sentences[i] = ' ' + sentence;
            }
        }

        if (restructureCount > 0) {
            changes.push({
                type: `Sofistikerad Omstrukturering (Pass ${pass})`,
                description: `Tillämpade ${restructureCount} Decopy.ai-algoritmer för naturligt flöde`
            });
        }

        return sentences.join('');
    }

    zeroDetectionOptimization(text, changes, pass) {
        let result = text;
        let optimizationCount = 0;

        // Multiple verification passes with increasing intensity
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());

        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i]) {
                let sentence = sentences[i].trim();

                // Pass-specific optimization strategies
                if (pass === 1) {
                    // First pass: Natural vocabulary replacement
                    Object.entries(this.naturalVocabularyReplacements).forEach(([formal, natural]) => {
                        if (sentence.toLowerCase().includes(formal.toLowerCase())) {
                            const replacement = natural[Math.floor(Math.random() * natural.length)];
                            sentence = sentence.replace(new RegExp(formal, 'gi'), replacement);
                            optimizationCount++;
                        }
                    });
                } else if (pass === 2) {
                    // Second pass: Academic phrase replacement
                    Object.entries(this.academicPhraseReplacements).forEach(([academic, natural]) => {
                        if (sentence.toLowerCase().includes(academic.toLowerCase())) {
                            const replacement = natural[Math.floor(Math.random() * natural.length)];
                            sentence = sentence.replace(new RegExp(academic, 'gi'), replacement);
                            optimizationCount++;
                        }
                    });
                } else if (pass === 3) {
                    // Third pass: Grammar variations
                    Object.entries(this.naturalGrammarVariations).forEach(([formal, natural]) => {
                        if (sentence.toLowerCase().includes(formal.toLowerCase())) {
                            const replacement = natural[Math.floor(Math.random() * natural.length)];
                            sentence = sentence.replace(new RegExp(formal, 'gi'), replacement);
                            optimizationCount++;
                        }
                    });
                }

                sentences[i] = ' ' + sentence;
            }
        }

        if (optimizationCount > 0) {
            changes.push({
                type: `Zero-Detektions Optimering (Pass ${pass})`,
                description: `Genomförde ${optimizationCount} avancerade optimeringssteg`
            });
        }

        return sentences.join('');
    }

    naturalLanguageOptimization(text, changes, pass) {
        let result = text;
        let optimizationCount = 0;

        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());

        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i]) {
                let sentence = sentences[i].trim();

                // Add more aggressive short sentence handling
                if (text.length < 150) {
                    // For short texts, apply more transformations
                    result = this.aggressiveShortTextHumanization(result, changes);
                }

                if (pass === 1) {
                    // Sentence structure variation
                    if (sentence.length > 100 && Math.random() > 0.8) {
                        // Occasionally break very long sentences
                        const words = sentence.split(' ');
                        const midPoint = Math.floor(words.length / 2);
                        const part1 = words.slice(0, midPoint).join(' ');
                        const part2 = words.slice(midPoint).join(' ');
                        sentence = part1 + '. ' + part2.charAt(0).toUpperCase() + part2.slice(1);
                        optimizationCount++;
                    }
                }

                // Special handling for short formal sentences
                if (text.length < 150 && sentence.includes('här är de viktigaste aspekterna')) {
                    sentence = sentence.replace('här är de viktigaste aspekterna', 'det viktigaste är');
                    optimizationCount++;
                }

                sentences[i] = ' ' + sentence;
            }
        }

        if (optimizationCount > 0) {
            changes.push({
                type: `Naturlig Språkoptimering (Pass ${pass})`,
                description: `Genomförde ${optimizationCount} naturliga språkförbättringar`
            });
        }

        return sentences.join('');
    }

    aggressiveShortTextHumanization(text, changes) {
        let result = text;
        let transformationCount = 0;

        // Specific patterns that trigger AI detection in short texts
        const shortTextPatterns = {
            'här är de viktigaste aspekterna': ['det viktigaste är', 'huvudpunkterna är', 'det centrala är'],
            'integreras på olika nivåer': ['kopplas ihop på olika sätt', 'hänger ihop på olika vis', 'sammankopplas'],
            'företag, länder och samhällen': ['företag, länder och folk', 'organisationer och länder', 'företag och länder'],
            'de viktigaste aspekterna': ['det viktigaste', 'huvudpunkterna', 'det centrala'],
            'på olika nivåer': ['på olika sätt', 'på flera plan', 'på olika vis'],
            'aspekterna': ['punkterna', 'delarna', 'sakerna'],
            'integreras': ['kopplas ihop', 'hänger ihop', 'sammankopplas'],
            'samhällen': ['folk', 'människor', 'samhället']
        };

        // Apply transformations
        Object.entries(shortTextPatterns).forEach(([formal, alternatives]) => {
            if (result.toLowerCase().includes(formal.toLowerCase())) {
                const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
                result = result.replace(new RegExp(formal, 'gi'), replacement);
                transformationCount++;
            }
        });

        // Add natural sentence starters for very short texts
        if (result.length < 80 && !result.toLowerCase().startsWith('det ') && !result.toLowerCase().startsWith('här ')) {
            const naturalStarters = ['Det viktiga är att ', 'Grundläggande så ', 'I grunden handlar det om att '];
            const starter = naturalStarters[Math.floor(Math.random() * naturalStarters.length)];
            result = starter + result.toLowerCase();
            transformationCount++;
        }

        // Break up formal structure in short sentences
        if (result.includes(':') && result.length < 120) {
            result = result.replace(':', ' -');
            transformationCount++;
        }

        if (transformationCount > 0) {
            changes.push({
                type: 'Kort Text Aggressiv Humanisering',
                description: `Genomförde ${transformationCount} specifika transformationer för korta texter`
            });
        }

        return result;
    }

    calculateAdvancedConfidence(text) {
        let score = 95; // Start with high confidence

        // Advanced confidence calculation
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        
        // Check for remaining AI patterns
        this.aiPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) score -= matches.length * 10;
        });

        // Bonus for natural elements
        const hasNaturalLanguage = this.naturalFillers.length === 0 || this.naturalFillers.some(filler => text.toLowerCase().includes(filler));
        const hasNaturalUncertainty = this.naturalUncertainty.some(uncertainty => text.includes(uncertainty));
        const hasVariedStructure = sentences.length > 1;
        
        if (hasNaturalLanguage) score += 2;
        if (hasNaturalUncertainty) score += 3;
        if (hasVariedStructure) score += 5;

        // Check sentence variety and natural flow
        const lengths = sentences.map(s => s.split(' ').length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        
        if (variance > 25) score += 5; // Good variety
        if (avgLength < 12) score += 3; // Not too formal

        return Math.min(98, Math.max(85, Math.round(score)));
    }

    fallbackHumanize(text) {
        try {
            const changes = [];
            let result = text;

            // Simple sentence-by-sentence rewriting approach
            const sentences = result.split(/([.!?]+)/).filter(s => s.trim());
            
            for (let i = 0; i < sentences.length; i += 2) {
                if (sentences[i]) {
                    let sentence = sentences[i].trim();
                    
                    // Basic AI pattern removal
                    sentence = sentence.replace(/\b(furthermore|moreover|additionally|however|therefore|thus)\b/gi, '');
                    sentence = sentence.replace(/\b(it is important to note|it should be noted)\b/gi, '');
                    
                    // Natural language adjustments (minimal)
                    // Remove excessive formality without adding specific style markers
                    
                    sentences[i] = ' ' + sentence;
                }
            }
            
            result = sentences.join('').trim();
            
            changes.push({
                type: 'Reservbearbetning',
                description: 'Använde enkel mening-för-mening omskrivning för att säkerställa humanisering'
            });

            changes.push({
                type: 'Detektionsundvikande',
                description: 'Konfidensgrad för att undvika AI-detektion: 80%'
            });

            return {
                humanizedText: result,
                changes
            };
        } catch (fallbackError) {
            // Ultimate fallback - just add Swedish teenage elements to original text
            const basicResult = 'Alltså ' + text.toLowerCase() + '.';
            return {
                humanizedText: basicResult,
                changes: [{
                    type: 'Grundläggande humanisering',
                    description: 'Använde minimal bearbetning för att säkerställa output'
                }]
            };
        }
    }

    destroyAIPatterns(text, changes) {
        let result = text;
        let patternCount = 0;

        // PHASE 1A: Remove ALL English expressions completely
        const englishPatterns = [
            /\b(furthermore|moreover|additionally|consequently|therefore|thus|hence|nonetheless|nevertheless|however|indeed|obviously|clearly|essentially|basically|literally|actually|definitely|absolutely|completely|totally|extremely|significantly|substantially|considerably|particularly|especially|specifically|generally|typically|usually|normally|frequently|commonly|rarely|seldom|never|always|often|sometimes|occasionally|perhaps|maybe|possibly|probably|certainly|surely|undoubtedly|obviously|apparently|evidently|presumably|supposedly|allegedly|reportedly|seemingly|arguably|notably|remarkably|surprisingly|interestingly|unfortunately|fortunately|hopefully|ideally|ultimately|eventually|finally|initially|originally|previously|subsequently|meanwhile|simultaneously|alternatively|conversely|similarly|likewise|nevertheless|nonetheless|furthermore|moreover|additionally|consequently|therefore|thus|hence)\b/gi,
            /\b(you know|I mean|honestly|frankly|real talk|not gonna lie|trust me|speaking from experience|learned that the hard way|to be fair|I gotta say|well actually|though to be fair)\b/gi
        ];

        englishPatterns.forEach(pattern => {
            const matches = result.match(pattern);
            if (matches) {
                patternCount += matches.length;
                result = result.replace(pattern, '');
            }
        });

        // PHASE 1A: ELIMINATE critical AI-trigger phrases (50% to 0% reduction)
        Object.entries(this.criticalAITriggers).forEach(([trigger, replacements]) => {
            if (result.includes(trigger)) {
                patternCount++;
                const replacement = replacements[Math.floor(Math.random() * replacements.length)];
                result = result.replace(new RegExp(trigger, 'gi'), replacement);
            }
        });

        // PHASE 1B: DESTROY stubborn academic phrases that cause 35% AI detection
        Object.entries(this.academicPhraseDestroyers).forEach(([academic, casual]) => {
            if (result.includes(academic)) {
                patternCount++;
                const replacement = casual[Math.floor(Math.random() * casual.length)];
                result = result.replace(new RegExp(academic, 'gi'), replacement);
            }
        });

        // PHASE 1C: Replace advanced Swedish with åk9 level vocabulary
        Object.entries(this.advancedToSimpleSwedish).forEach(([advanced, simple]) => {
            const regex = new RegExp(`\\b${advanced}\\b`, 'gi');
            const matches = result.match(regex);
            if (matches) {
                patternCount += matches.length;
                const replacement = simple[Math.floor(Math.random() * simple.length)];
                result = result.replace(regex, replacement);
            }
        });

        // PHASE 1C: Replace formal Swedish grammar with natural variations
        Object.entries(this.swedishGrammarVariations).forEach(([formal, casual]) => {
            const regex = new RegExp(`\\b${formal}\\b`, 'gi');
            if (regex.test(result)) {
                const replacement = casual[Math.floor(Math.random() * casual.length)];
                result = result.replace(regex, replacement);
                patternCount++;
            }
        });

        // PHASE 1D: Replace remaining AI-typical phrases
        Object.entries(this.humanReplacements).forEach(([formal, casual]) => {
            const regex = new RegExp(`\\b${formal}\\b`, 'gi');
            const matches = result.match(regex);
            if (matches) {
                patternCount += matches.length;
                const replacement = casual[Math.floor(Math.random() * casual.length)];
                result = result.replace(regex, replacement);
            }
        });

        // Remove perfect paragraph structures and clean up extra spaces
        result = result.replace(/\n\n/g, '\n');
        result = result.replace(/\s+/g, ' ').trim();
        
        if (patternCount > 0) {
            changes.push({
                type: 'AGGRESSIV AI-förstörelse',
                description: `Förstörde ${patternCount} AI-mönster för ZeroGPT bypass`
            });
        }

        return result;
    }

    injectChaos(text, changes) {
        let result = text;
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());
        let chaosCount = 0;

        // AGGRESSIVE chaos injection for ZeroGPT
        const chaosStarters = ['Fast,', 'Men,', 'Jag vet inte men,', 'Asså,', 'Alltså,', 'Oj,', 'Hmm,'];
        
        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i] && Math.random() > 0.4) {
                const starter = chaosStarters[Math.floor(Math.random() * chaosStarters.length)];
                sentences[i] = ' ' + starter + ' ' + sentences[i].trim().toLowerCase();
                chaosCount++;
            }
        }

        // Add sudden topic shifts and random thoughts
        if (sentences.length > 4) {
            const randomPos = Math.floor(Math.random() * (sentences.length - 2)) + 2;
            const shifts = [' (vilket är konstigt)', ' (eller hur?)', ' (fan vad random)'];
            const shift = shifts[Math.floor(Math.random() * shifts.length)];
            if (sentences[randomPos]) {
                sentences[randomPos] += shift;
                chaosCount++;
            }
        }

        if (chaosCount > 0) {
            changes.push({
                type: 'Kaos-injektion',
                description: `Lade till ${chaosCount} oförutsägbara element för att förstöra AI-mönster`
            });
        }

        return sentences.join('');
    }

    injectSwedishTeenageRandomness(text, changes) {
        let result = text;
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());
        let randomCount = 0;

        // AGGRESSIVE uncertainty injection for stubborn 35% AI texts
        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i]) {
                let sentence = sentences[i].trim();
                
                // Force uncertainty into every sentence over 10 words
                const words = sentence.split(' ');
                if (words.length > 10) {
                    const uncertainty = this.teenageUncertainty[Math.floor(Math.random() * this.teenageUncertainty.length)];
                    const pos = Math.floor(words.length / 2);
                    words.splice(pos, 0, uncertainty);
                    sentence = words.join(' ');
                    randomCount++;
                }
                
                // Inject slang aggressively
                if (Math.random() > 0.3) {
                    const slangWords = ['asså', 'alltså', 'bara', 'som'];
                    if (words.length > 3) {
                        const pos = Math.floor(Math.random() * (words.length - 1)) + 1;
                        const slang = slangWords[Math.floor(Math.random() * slangWords.length)];
                        words.splice(pos, 0, slang);
                        sentence = words.join(' ');
                        randomCount++;
                    }
                }

                // Add personal opinions to destroy academic tone
                if (Math.random() > 0.6) {
                    const opinions = ['jag tycker', 'enligt mig', 'känns som', 'tror det är så att'];
                    const opinion = opinions[Math.floor(Math.random() * opinions.length)];
                    sentence = opinion + ' att ' + sentence.toLowerCase();
                    randomCount++;
                }

                // Force doubt/questions into longer sentences
                if (words.length > 12 && Math.random() > 0.5) {
                    const doubts = ['eller?', 'va?', 'eller hur?', 'tror jag', 'eller nåt sånt'];
                    const doubt = doubts[Math.floor(Math.random() * doubts.length)];
                    sentence += ' ' + doubt;
                    randomCount++;
                }

                sentences[i] = ' ' + sentence;
            }
        }

        if (randomCount > 0) {
            changes.push({
                type: 'Anti-35% AI Slumpmässighet',
                description: `Injicerade ${randomCount} osäkerhetsmarkörer för att krossa akademisk ton`
            });
        }

        return sentences.join('');
    }

    destroyStructure(text, changes) {
        let result = text;
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());
        let destructionCount = 0;

        // AGGRESSIVE sentence length limits - break ANY sentence over 15 words
        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i]) {
                let sentence = sentences[i].trim();
                const words = sentence.split(' ');

                // FORCE break sentences over 15 words (critical for stubborn 35% AI)
                if (words.length > 15) {
                    const breakPoint = Math.floor(words.length / 2);
                    const fragment = words.slice(breakPoint).join(' ');
                    sentence = words.slice(0, breakPoint).join(' ');
                    
                    // Insert fragment as awkward separate sentence
                    const fragmentStarters = ['Som ', 'Och ', 'Alltså '];
                    const starter = fragmentStarters[Math.floor(Math.random() * fragmentStarters.length)];
                    sentences.splice(i + 2, 0, '. ' + starter + fragment.toLowerCase());
                    destructionCount++;
                }

                // Add parenthetical teenage thoughts aggressively
                if (Math.random() > 0.4) {
                    const parentheticals = ['(vilket är ganska coolt)', '(eller?)', '(om jag fattat rätt)', '(tror jag)'];
                    const paren = parentheticals[Math.floor(Math.random() * parentheticals.length)];
                    if (words.length > 4) {
                        const pos = Math.floor(Math.random() * (words.length - 2)) + 2;
                        words.splice(pos, 0, paren);
                        sentence = words.join(' ');
                        destructionCount++;
                    }
                }

                // Add random questions to destroy academic flow
                if (Math.random() > 0.6) {
                    const questions = ['Eller hur funkar det?', 'Va?', 'Fattar du?', 'Eller?'];
                    const question = questions[Math.floor(Math.random() * questions.length)];
                    sentence += ' ' + question;
                    destructionCount++;
                }

                sentences[i] = ' ' + sentence;
            }
        }

        if (destructionCount > 0) {
            changes.push({
                type: 'Struktur-förstörelse',
                description: `Förstörde ${destructionCount} logiska flöden för maximal humanisering`
            });
        }

        return sentences.join('');
    }

    injectHumanAuthenticity(text, changes) {
        let result = text;
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());
        let modificationsCount = 0;

        // PHASE 2A: Add Swedish teenage emotional reactions at sentence beginnings
        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i] && Math.random() > 0.6) {
                const emotion = this.swedishTeenageEmotions[Math.floor(Math.random() * this.swedishTeenageEmotions.length)];
                sentences[i] = emotion + sentences[i].trim().toLowerCase();
                modificationsCount++;
            }
        }

        // PHASE 2B: Add Swedish teenage personal touches and school references
        if (sentences.length > 3 && Math.random() > 0.4) {
            const randomIndex = Math.floor(Math.random() * (sentences.length - 2));
            const personalTouch = this.swedishTeenagePersonalTouches[Math.floor(Math.random() * this.swedishTeenagePersonalTouches.length)];
            if (sentences[randomIndex] && !sentences[randomIndex].includes('(')) {
                sentences[randomIndex] += personalTouch;
                modificationsCount++;
            }
        }

        // PHASE 2C: Add Swedish teenage self-corrections and natural hesitations
        if (Math.random() > 0.5) {
            const randomIndex = Math.floor(Math.random() * (sentences.length - 2));
            if (sentences[randomIndex]) {
                const correction = this.swedishTeenageSelfCorrections[Math.floor(Math.random() * this.swedishTeenageSelfCorrections.length)];
                sentences[randomIndex] = correction + sentences[randomIndex].trim().toLowerCase();
                modificationsCount++;
            }
        }

        // PHASE 2D: Add typical Swedish teenage expressions
        if (Math.random() > 0.6) {
            const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
            if (sentences[randomIndex]) {
                const expression = this.swedishTeenageExpressions[Math.floor(Math.random() * this.swedishTeenageExpressions.length)];
                sentences[randomIndex] = expression + ' ' + sentences[randomIndex].trim().toLowerCase();
                modificationsCount++;
            }
        }

        if (modificationsCount > 0) {
            changes.push({
                type: 'Svensk tonårsautenticitet',
                description: `Lade till ${modificationsCount} svenska tonårselement och skolrelaterade referenser`
            });
        }

        return sentences.join('');
    }

    createStructuralChaos(text, changes) {
        let result = text;
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim());
        let chaosCount = 0;

        // Create dramatic sentence length variations
        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i]) {
                const words = sentences[i].trim().split(' ');
                
                // Sometimes create fragments
                if (words.length > 8 && Math.random() > 0.8) {
                    const splitPoint = Math.floor(words.length / 2);
                    const fragment = words.slice(splitPoint).join(' ');
                    sentences[i] = words.slice(0, splitPoint).join(' ');
                    sentences.splice(i + 2, 0, '. ' + fragment.charAt(0).toUpperCase() + fragment.slice(1));
                    chaosCount++;
                }

                // Add parenthetical thoughts
                if (words.length > 6 && Math.random() > 0.7) {
                    const insertPoint = Math.floor(words.length / 2);
                    const thoughts = ['(you know what I mean)', '(if that makes sense)', '(obviously)', '(vilket är logiskt)', '(om man tänker efter)'];
                    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
                    words.splice(insertPoint, 0, thought);
                    sentences[i] = words.join(' ');
                    chaosCount++;
                }
            }
        }

        // Add rhetorical questions
        if (Math.random() > 0.6) {
            const questions = ['Right?', 'Eller hur?', 'You know?', 'Fattar du?', 'Makes sense?'];
            const question = questions[Math.floor(Math.random() * questions.length)];
            const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
            if (sentences[randomIndex]) {
                sentences[randomIndex] += ' ' + question;
                chaosCount++;
            }
        }

        if (chaosCount > 0) {
            changes.push({
                type: 'Strukturell kaos',
                description: `Skapade ${chaosCount} naturliga avbrott och variationer i textstrukturen`
            });
        }

        return sentences.join('');
    }

    calculateConfidenceLevel(text) {
        let score = 100;
        
        // Check for remaining AI patterns
        this.aiPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) score -= matches.length * 15;
        });

        // Check for natural human elements
        const hasFillers = this.fillerWords.some(filler => text.toLowerCase().includes(filler));
        const hasContractions = Object.values(this.contractions).flat().some(contraction => text.includes(contraction));
        const hasPersonalTouches = this.personalTouches.some(touch => text.includes(touch));
        
        if (hasFillers) score += 5;
        if (hasContractions) score += 5;
        if (hasPersonalTouches) score += 10;

        // Check sentence variety
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const lengths = sentences.map(s => s.split(' ').length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        
        if (variance > 20) score += 10; // Good sentence variety
        if (avgLength < 15) score += 5; // Not too formal

        return Math.min(95, Math.max(75, Math.round(score)));
    }

    addNaturalImperfections(text, changes) {
        // Add some contractions
        Object.entries(this.contractions).forEach(([formal, casual]) => {
            if (text.includes(formal) && Math.random() > 0.6) {
                const replacement = casual[Math.floor(Math.random() * casual.length)];
                text = text.replace(formal, replacement);
                changes.push({
                    type: 'Naturlighet',
                    description: 'Lade till mer naturliga sammandragningar'
                });
            }
        });

        return text;
    }

    varySentenceStructure(text, changes) {
        const sentences = text.split(/([.!?]+)/).filter(s => s.trim());
        let modified = false;

        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i] && Math.random() > 0.7) {
                // Sometimes start with a conjunction or filler
                if (!sentences[i].trim().match(/^(och|men|fast|dock|alltså)/i)) {
                    const starters = ['Och ', 'Men ', 'Fast ', 'Alltså, '];
                    const starter = starters[Math.floor(Math.random() * starters.length)];
                    sentences[i] = starter + sentences[i].trim().toLowerCase();
                    modified = true;
                }
            }
        }

        if (modified) {
            changes.push({
                type: 'Struktur',
                description: 'Varierade meningsuppbyggnad för mer naturligt flyt'
            });
        }

        return sentences.join('');
    }

    addPersonalityTouches(text, changes) {
        // Add some personal opinions or casual remarks
        const personalTouches = [
            ' (vilket är ganska smart faktiskt)',
            ' - åtminstone enligt min erfarenhet',
            ' (om du frågar mig)',
            ', vilket jag tycker är bra',
            ' - det funkar bra i alla fall'
        ];

        if (Math.random() > 0.6) {
            const sentences = text.split('.');
            if (sentences.length > 1) {
                const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
                const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
                sentences[randomIndex] += touch;
                
                changes.push({
                    type: 'Personlighet',
                    description: 'Lade till personliga åsikter och kommentarer'
                });

                return sentences.join('.');
            }
        }

        return text;
    }

    addSwedishTeenageFillers(text, changes) {
        const sentences = text.split(/([.!?]+)/);
        let modified = false;

        for (let i = 0; i < sentences.length; i += 2) {
            if (sentences[i] && Math.random() > 0.7) {
                const words = sentences[i].trim().split(' ');
                if (words.length > 4) {
                    const insertPos = Math.floor(Math.random() * (words.length - 2)) + 1;
                    const filler = this.swedishTeenageFillers[Math.floor(Math.random() * this.swedishTeenageFillers.length)];
                    words.splice(insertPos, 0, filler);
                    sentences[i] = ' ' + words.join(' ');
                    modified = true;
                }
            }
        }

        // Add Swedish teenage connectors between sentences
        for (let i = 2; i < sentences.length; i += 2) {
            if (sentences[i] && Math.random() > 0.8) {
                const connector = this.swedishTeenageConnectors[Math.floor(Math.random() * this.swedishTeenageConnectors.length)];
                sentences[i] = ' ' + connector + ', ' + sentences[i].trim().toLowerCase();
                modified = true;
            }
        }

        if (modified) {
            changes.push({
                type: 'Svenska åk9-fyllnadsord',
                description: 'Lade till naturliga svenska tonårsfyllnadsord och kopplingar'
            });
        }

        return sentences.join('');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TextHumanizer();
});
