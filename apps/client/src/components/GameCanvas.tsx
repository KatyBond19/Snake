interface GameCanvasProps {
  width: number
  height: number
}

export function GameCanvas({ width, height }: GameCanvasProps): JSX.Element {
  return (
    <canvas
      width={width}
      height={height}
      style={{ border: '1px solid #333', display: 'block', marginBottom: 16 }}
    >
      Игровое поле (заглушка)
    </canvas>
  )
}
