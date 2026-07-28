export interface AIFoodResult {
  food_name: string
  brand: string | null
  quantity: number
  unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  salt_g: number
  confidence: 'alta' | 'media' | 'bassa' | string
  notes: string
}

/**
 * Ridimensiona e comprime un'immagine lato client prima dell'invio,
 * per mantenere le richieste veloci ed economiche.
 */
export function resizeImageToBase64(file: File, maxDimension = 1024, quality = 0.82): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Impossibile leggere il file'))
    reader.onload = () => {
      img.onerror = () => reject(new Error('Impossibile leggere l\'immagine'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas non supportato'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const base64 = dataUrl.split(',')[1]
        resolve({ base64, mimeType: 'image/jpeg' })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
