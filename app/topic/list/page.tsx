import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getTopicList } from '@/lib/db'
import { CalendarDays, Edit, Share2 } from 'lucide-react'
import Link from 'next/link'

import { DeleteTopicDialog } from './delete-topic-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

export default async function CardWithForm() {
  const topics = await getTopicList()
  console.log(topics)
  return (
    <div className="p-4">
      <Link href="/topic/create">
        <Button>创建话题</Button>
      </Link>
      <div className="flex flex-wrap gap-4 mt-4">
        {topics.map(topic => (
          <Card key={topic.id} className="w-[350px]  group relative">
            <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Link href={'/topic/edit/' + topic.id}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
              <DeleteTopicDialog topicId={topic.id} />
            </div>
            <CardHeader>
              <CardTitle>{topic.name}</CardTitle>
              <CardDescription>
                {topic._count.urls} 个链接 | {topic.createdAt.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                {topic.urls.map((item, index) => (
                  <HoverCard key={index}>
                    <HoverCardTrigger asChild>
                      <Button className="p-0 h-6 flex gap-1" variant="link">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={item.icon || ''} />
                          <AvatarFallback>img</AvatarFallback>
                        </Avatar>
                        <Link target="_blank" href={item.url}>
                          {item.title}
                        </Link>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src={item.icon || ''} />
                          <AvatarFallback>icon</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm">{item.description}</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
