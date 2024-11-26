import type { Prisma, Topic, Url } from '@prisma/client'
import prisma from './prisma'

// type NullToUndefined<T> = {
//   [K in keyof T]: null extends T[K] ? undefined | Exclude<T[K], null> : T[K]
// }

type BaseEntity = {
  id: number
  createdAt: Date
  updatedAt: Date
}

type NullToUndefined<T> = {
  [K in keyof T as null extends T[K] ? K : never]?: undefined | Exclude<T[K], null>
} & {
  [K in keyof T as null extends T[K] ? never : K]: T[K]
}

type TopicDto = Omit<NullToUndefined<Topic>, keyof BaseEntity>
type UrlDto = Omit<NullToUndefined<Url>, keyof BaseEntity>

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

export async function getTopicList() {
  return prisma.topic.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      urls: {
        select: {
          icon: true,
          title: true,
          description: true,
          url: true,
        },
      },
      _count: {
        select: {
          urls: true,
        },
      },
    },
  })
}

export function getTopic(id: string) {
  return prisma.topic.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      urls: {
        select: {
          id: true,
          title: true,
          url: true,
          icon: true,
          description: true,
        },
      },
    },
  })
}

export async function createTopic(data: { name: string; urls: Prisma.UrlCreateWithoutTopicInput[] }) {
  return prisma.topic.create({
    data: {
      name: data.name,
      urls: {
        create: data.urls,
      },
    },
    select: { id: true },
  })
}

export function updateTopic(data: {
  id: string
  name: string
  createMany: Prisma.UrlCreateWithoutTopicInput[]
  updateMany: Prisma.UrlUncheckedUpdateWithoutTopicInput[]
  deleteMany: number[]
}) {
  return prisma.topic.update({
    where: { id: data.id },
    data: {
      name: data.name,
      urls: {
        createMany: { data: data.createMany },
        updateMany: data.updateMany.map(({ id, ...rest }) => ({
          where: { id: id as number },
          data: rest,
        })),
        deleteMany: {
          id: {
            in: data.deleteMany,
          },
        },
      },
    },
  })
}
