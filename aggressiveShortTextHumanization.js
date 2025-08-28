// Add this method to the HumanizationTechniques class
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
