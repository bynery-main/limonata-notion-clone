'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LightMode } from "@chakra-ui/react";
import { CloudIcon, CodeIcon, MessageCircleIcon, UserIcon, GlobeIcon, ShareIcon, BookIcon, PencilIcon, Share2Icon, FolderArchiveIcon, FolderIcon, FoldersIcon, Lightbulb, LightbulbIcon, BookOpenIcon } from "lucide-react"

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function PricingPage() {
  return (
    <div className="min-w-1000flex flex-col items-center justify-center p-4 overflow-show">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
          <span className="bg-black text-white rounded-full p-2 mr-2">
            <LightbulbIcon className="h-6 w-6" />
          </span>
          Get Limonata Pro
        </h1>
        <p className="text-gray-600">No trials. No commitments. <b>10x </b>the amount of credits.</p>
      </div>

      <Card className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <Feature icon={<CloudIcon />} title="Massive Storage" description="Up to 50GB per Workspace" />
            <Feature icon={<BookOpenIcon />} title="Unlimited Flashcards" description="Create ten times more!" />
            <Feature icon={<MessageCircleIcon />} title="10x Chats" description="Many more chats with your AI tutor" />
          </div>
          <div className="space-y-4">
            <Feature icon={<BookIcon />} title="10x Studyguides" description="Create many more study guides" />
            <Feature icon={<PencilIcon />} title="10x Quizzes" description="Test yourself and improve over and over" />
            <Feature icon={<FoldersIcon />} title="10x Workspaces" description="Create and join as many as you want" />
          </div>
        </div>
      </Card>

      <p className=" text-gray-600 mt-6 mb-8 text-center">All our features are available to all users</p>

      <div className="text-center">
        <h2 className="text-6xl font-bold mb-2">$4,99<span className="text-2xl font-normal text-gray-600">/month</span></h2>

      </div>
    </div>
  )
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex items-start">
      <div className="bg-gray-100 rounded-full p-3 mr-4">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}