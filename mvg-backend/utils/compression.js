exports.imageNaming = (req) => {
  const { buffer, originalname, mimetype, size } = req.file;
  // console.log('originalName', originalname)

  let name2

  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') name2 = splitExtension(originalname, 'jpg');
  else if (mimetype === 'image/png') { name2 = splitExtension(originalname, 'png') }

  // console.log('name2', name2)

  const compressedName = `${name2}-${Date.now()}.webp`
  console.log('compressedName', compressedName)

  return { compressedName: compressedName, buffer: buffer, originalSize: size}
}


const splitExtension = (name, extension) => {
  return name.split(' ').join('_').split(`.${extension}`)[0]
}
