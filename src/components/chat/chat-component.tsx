/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/W850iWFBUkB
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function ChatComponent() {
  const [isChatVisible, setIsChatVisible] = useState(true)
  const [messages, setMessages] = useState([
    { type: 'assistant', content: "Hello! I'm Lemon, an AI assistant created by Limonata.inc. How can I help you today?" },
    { type: 'user', content: "Hi there! Do you what's the powerhouse of the cell?" },
    { type: 'assistant', content: "Yes, the mitochondria is the powerhouse of the cell. It's responsible for producing energy in the form of ATP." },
    { type: 'user', content: "Thanks! That's very helpful. You saved my exam" },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible)
  }
  const handleSend = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { type: 'user', content: inputMessage.trim() }])
      setInputMessage("")
    }
  }
  
  return (
    <>
      {isChatVisible ? (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md overflow-hidden bg-background/60 backdrop-blur-sm md:w-[400px] transition-transform duration-3000 ease-in-out shadow-2xl">
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-background/10 bg-background/40  px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">LemonGPT</div>
              </div>
              <Button onClick={toggleChat} className="bg-white p-2 hover:bg-black">
              <XIcon className="h-5 w-5 text-black hover:text-white" />
              <span className="sr-only">Close</span>
            </Button>
            </div>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="grid gap-4 p-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                    {message.type === 'assistant' && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg p-3 text-sm shadow ${message.type === 'user' ? 'bg-primary/80 backdrop-blur-sm text-primary-foreground' : 'bg-muted/20 backdrop-blur-sm'}`}style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
                      <p>{message.content}</p>
                    </div>
                    {message.type === 'user' && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src="/placeholder-user.jpg" alt="Image" />
                        <AvatarFallback>YO</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-background/10 bg-background/50 px-4 py-3 backdrop-blur-sm">
              <div className="relative flex">
              <Textarea
                  placeholder="Type your message..."
                  name="message"
                  id="message"
                  rows={1}
                  className="min-h-[48px] w-full rounded-2xl resize-none p-4 pr-16 shadow-sm bg-background/50 backdrop-blur-sm"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                   className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary/80 hover:bg-primary/90"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground"
            onClick={toggleChat}
          >
            <ChatIcon className="h-6 w-6" />
            <span className="sr-only">Open Chat</span>
          </Button>
        </div>
      )}
    </>
  )
}
function ChatIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  )
}
function ArrowUpIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
export default ChatComponent;