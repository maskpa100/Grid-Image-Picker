import React, { useState } from 'react'
import './App.css'

export interface Cell {
  id: number
  image?: string // data URL or remote URL
}

const DEFAULT_COLUMNS = 4
const DEFAULT_ROWS = 3

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=800&q=60',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=60',
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&q=60',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=60',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=60',
]

function makeGrid(rows: number, cols: number) {
  const cells: Cell[] = []
  let id = 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ id: id++ })
    }
  }
  return cells
}

export default function App() {
  const [cols] = useState(DEFAULT_COLUMNS)
  const [cells, setCells] = useState<Cell[]>(() => makeGrid(DEFAULT_ROWS, DEFAULT_COLUMNS))
  const [modalOpen, setModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [availableImages, setAvailableImages] = useState<string[]>(SAMPLE_IMAGES)

  // Open modal for a given cell index
  const openModal = (index: number) => {
    setActiveIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setActiveIndex(null)
  }

  const setImageToCell = (index: number, imageUrl?: string) => {
    setCells(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], image: imageUrl }
      return copy
    })
  }

  const onUploadFile = (file: File | null) => {
    if (!file || !activeIndex && activeIndex !== 0) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Add to available images and set to cell
      setAvailableImages(prev => [result, ...prev])
      setImageToCell(activeIndex as number, result)
      closeModal()
    }
    reader.readAsDataURL(file)
  }

  // Drag & Drop handlers (HTML5 DnD)
  const onDragStart = (e: React.DragEvent, sourceIndex: number) => {
    e.dataTransfer.setData('text/plain', String(sourceIndex))
    // Optionally, set drag image
    // e.dataTransfer.setDragImage(e.currentTarget as Element, 40, 40)
  }

  const onDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const src = e.dataTransfer.getData('text/plain')
    if (!src) return
    const sourceIndex = Number(src)
    if (Number.isNaN(sourceIndex)) return
    // swap images between sourceIndex and targetIndex
    setCells(prev => {
      const copy = [...prev]
      const srcImage = copy[sourceIndex].image
      copy[sourceIndex] = { ...copy[sourceIndex], image: copy[targetIndex].image }
      copy[targetIndex] = { ...copy[targetIndex], image: srcImage }
      return copy
    })
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const clearCell = (index: number) => {
    setImageToCell(index, undefined)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Grid Image Picker — React + TS</h1>
        <p className="muted">Клик на пустую ячейку — выбрать картинку. Перетаскивай мышкой, чтобы поменять местами.</p>
      </header>

      <main>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {cells.map((cell, i) => (
            <div
              key={cell.id}
              className="cell"
              onClick={() => openModal(i)}
              onDrop={e => onDrop(e, i)}
              onDragOver={onDragOver}
            >
              {cell.image ? (
                <>
                  <img
                    src={cell.image}
                    draggable
                    onDragStart={e => onDragStart(e, i)}
                    alt={`cell-${i}`}
                    className="cell-image"
                  />
                  <button className="clear-btn" onClick={e => { e.stopPropagation(); clearCell(i) }} title="Очистить">
                    ×
                  </button>
                </>
              ) : (
                <div className="empty">+</div>
              )}
            </div>
          ))}
        </div>
      </main>

      {modalOpen && activeIndex !== null && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Выберите картинку для ячейки #{activeIndex + 1}</h2>
            <div className="thumbs">
              {availableImages.map((src, idx) => (
                <button
                  key={idx}
                  className="thumb"
                  onClick={() => { setImageToCell(activeIndex, src); closeModal() }}
                >
                  <img src={src} alt={`thumb-${idx}`} />
                </button>
              ))}
            </div>

            <div className="upload-row">
              <label className="upload-label">
                Загрузить свою картинку
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => onUploadFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={closeModal} className="btn">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">Made with ❤️</footer>
    </div>
  )
}
