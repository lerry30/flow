const TitleFormat = (sentence='') => {
    // apa style - title case capitalization
    // short conjunctions (e.g., “and,” “as,” “but,” “for,” “if,” “nor,” “or,” “so,” “yet”)
    // articles (“a,” “an,” “the”)
    // short prepositions (e.g., “as,” “at,” “by,” “for,” “in,” “of,” “off,” “on,” “per,” “to,” “up,” “via”)
    const capNotIncluded = [ 'and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'as', 'at', 'by', 'for', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via' ];

    if(typeof sentence !== 'string') return undefined;
    if(sentence === '') return '';

    let fSentence = '';
    const words = sentence.trim().toLowerCase().split(' ');
    for(const word of words) {
        let cword = word;
        if(!capNotIncluded.includes(word)) {
            cword = `${ word[0]?.toUpperCase() }${ word.substring(1) }`;
        }

        fSentence = `${ fSentence } ${ cword }`;
    }

    return fSentence.trim();
}

export default TitleFormat;
