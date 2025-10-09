import express from 'express'
import multer from 'multer'
import PDFDocument from 'pdfkit'

const app = express()
const upload: any = multer({ storage: multer.memoryStorage() }) // salva em memória

app.post('/image-to-pdf', upload.single('image'), (req, res) => {
  const { filename } = req.body

  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada.' })
  }
  if (!filename) {
    return res.status(400).json({ error: "O campo 'filename' é obrigatório." })
  }

  const doc: any = new PDFDocument({ autoFirstPage: false })

  // Define headers do response
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${filename}.pdf"`)

  doc.pipe(res)

  // Lê dimensões da imagem
  const image = doc.openImage(req.file.buffer)
  doc.addPage({ size: [image.width, image.height] })
  doc.image(image, 0, 0)

  doc.end()
})

app.listen(3001, () => {
  console.log('🚀 Servidor rodando em http://localhost:3001')
})
