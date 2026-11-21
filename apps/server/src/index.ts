import { createGameServer } from './server.ts'

const port = Number(process.env.PORT ?? 3000)
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535')
}

const { httpServer } = createGameServer()
httpServer.listen(port, () => {
  console.log(`Snake server listening on port ${port}`)
})
