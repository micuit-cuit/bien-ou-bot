const Canvas = require('@napi-rs/canvas');
Canvas.GlobalFonts.registerFromPath("resource/NovaSquare-Book.ttf", 'NovaSquare')
Canvas.GlobalFonts.registerFromPath("resource/OpenSans-VariableFont_wdth,wght.ttf", 'OpenSans')
emoji = {
    "happy": "resource/happy.png",
    "neutral": "resource/neutral.png",
    "sad": "resource/sad.png"
}

async function drawHumeur(humeur, type){
    const canvas = Canvas.createCanvas(700, 200);
    const ctx = canvas.getContext('2d');
    //importation du background
    ctx.fillStyle = "#2d3146"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //dessine l'emoji
    let img
    try {
        let url = type
        if (emoji[type]) url = emoji[type]
        img = await Canvas.loadImage(url);
    } catch (error) {
        return "urlError"
    }
    ctx.drawImage(img, 50, 50, 100, 100);
    ctx.font = `300 30px OpenSans`;
    ctx.fillStyle =  "white"
    //calcule la taille du texte
    let text = humeur;
    let textWidth = ctx.measureText(text).width;
    //dessine le texte
    //si le texte est trop long (5 lignes) on le coupe et on met des ...
    if (text.length > 140) {// 35*5 = 175
        text = text.substring(0, 140-3);
        text += '...';
    }
    let lines = splitTextByLength(text+" ", 35, ctx);
    let center = canvas.height / 2 + 7.5;
    let space = 30;
    let y = center-(space*(lines.length/2))+15
    for (let line of lines) {
        ctx.fillText(line, 175, y);
        y += space;
    }
    const buffer = canvas.toBuffer('image/png');
    return buffer;
}
function splitTextByLength(texte, tailleMax) {
    const listeDecoupee = [];
    let indexDebut = 0;
    while (indexDebut < texte.length) {
        let indexFin = Math.min(indexDebut + tailleMax, texte.length);
        while (indexFin > indexDebut && texte[indexFin] !== ' ') {
            indexFin--;
        }
        if (indexFin === indexDebut) {
            indexFin = indexDebut + tailleMax;
        }
        listeDecoupee.push(texte.substring(indexDebut, indexFin).trim());
        indexDebut = indexFin + 1;
    }
    return listeDecoupee;
}


module.exports = drawHumeur;