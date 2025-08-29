declare module 'typewriter-effect' {
  interface TypewriterOptions {
    strings?: string[]
    autoStart?: boolean
    loop?: boolean
    delay?: number
    deleteSpeed?: number
    cursor?: string
    wrapperClassName?: string
    cursorClassName?: string
    stringSplitter?: (string: string) => string[]
    onCreateTextNode?: (char: string, node: Text) => Text
    onRemoveNode?: (node: Node) => void
  }

  export default class Typewriter {
    constructor(element: HTMLElement, options?: TypewriterOptions)

    typeString(string: string): this
    deleteAll(speed?: number): this
    deleteChars(amount: number): this
    pauseFor(ms: number): this
    callFunction(callback: () => void): this
    start(): this
    stop(): this

    // Additional methods
    changeDelay(delay: number): this
    changeDeleteSpeed(deleteSpeed: number): this
  }
}
