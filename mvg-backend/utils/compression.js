const sharp = require('sharp')

exports.imageNaming = (req) => {
  const { buffer, originalname, mimetype, size } = req.file;
  // console.log('originalName', originalname)

  let name2

  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') name2 = splitExtension(originalname, 'jpg');
  else if (mimetype === 'image/png') { name2 = splitExtension(originalname, 'png') }

  // console.log('name2', name2)

  const compressedName = `${name2}-${Date.now()}.webp`
  // console.log('compressedName', compressedName)

  return { compressedName: compressedName, buffer: buffer, originalSize: size}
}

exports.compressingWithSharp = async (buffer, compressedName, originalSize) => {
  // Enregistrement de la photo
  const responseSharp = await sharp(buffer)
    .webp({ quality: 20 })
    .toFile("./images/" + compressedName);

  // Information sur la compression
  console.log(
    "Compression:",
    `Avant: ${(originalSize / 1000000).toFixed(2)} Mo -`,
    `Après: ${(responseSharp.size / 1000000).toFixed(2)} Mo -`,
    `Taux de compression: ${((1-(responseSharp.size / originalSize))*100).toFixed(2)}%`
    )
}


const splitExtension = (name, extension) => {
  return name.split(' ').join('_').split(`.${extension}`)[0]
}
