'use client'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, RefreshCcw, Trash2 } from 'lucide-react'
import { formSchema } from './schema'
import { upsertTopic } from './actions'
import { http } from '@/lib/http'
import { useRouter } from 'next/navigation'
import { getTopic } from '@/lib/db'
import { getValidUrl, JsonBodyType } from '@/lib/utils'
import to from 'await-to-js'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { TagsInput } from '@/components/tags-input'
import { BatchAdd } from '../batch-add'
import Image from 'next/image'

export interface ClientFormProps {
  data?: Awaited<ReturnType<typeof getTopic>>
}

const defaultUrl = {
  title: '',
  url: '',
  tags: [],
}

export default function ClientForm({ data }: ClientFormProps) {
  console.log('data', data)
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data
      ? {
          ...data,
          description: data.description || undefined,
          urls: data.urls.map(url => ({
            ...url,
            url: url.url || undefined,
            icon: url.icon || undefined,
            description: url.description || undefined,
          })),
        }
      : {
          urls: [{ ...defaultUrl }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    keyName: 'key',
    name: 'urls',
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const [err, result] = await to<JsonBodyType<string>>(upsertTopic(values, data))
    if (err) {
      toast.error(err.message)
      return
    }
    const { status, message } = result
    if (status === 0) {
      toast.success('保存成功')
      router.back()
    } else {
      toast.error(message)
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-4">
                <FormLabel className="flex-shrink-0 w-20">标题</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-4">
                <FormLabel className="flex-shrink-0 w-20">描述</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={field.key} className="space-y-4 p-4 border rounded-md relative group">
              {fields.length > 1 && (
                <div className="absolute top-0 right-0 hidden group-hover:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => {
                      remove(index)
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
              <FormField
                name={`urls.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-4">
                      <FormLabel className="flex-shrink-0 w-20">Url</FormLabel>
                      <FormControl>
                        <div className="flex flex-1 gap-2">
                          <Input className="flex-1" {...field} />
                          <Button
                            type="button"
                            onClick={async () => {
                              const result = await form.trigger(`urls.${index}.url`)
                              if (!result) {
                                return
                              }
                              const [{ title, icon, description }] = await http.get<
                                {
                                  title: string
                                  icon: string
                                  description: string
                                }[]
                              >('/api/resolveUrl', {
                                urls: field.value,
                              })
                              form.setValue(`urls.${index}.title`, title)
                              form.setValue(`urls.${index}.icon`, icon)
                              form.setValue(`urls.${index}.description`, description)
                            }}
                          >
                            <RefreshCcw />
                          </Button>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`urls.${index}.tags`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-4">
                      <FormLabel className="flex-shrink-0 w-20">Tag</FormLabel>
                      <FormControl>
                        <TagsInput
                          // {...field}
                          className="w-full"
                          value={field.value || []}
                          onValueChange={v => {
                            field.onChange(v)
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`urls.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-4">
                      <FormLabel className="flex-shrink-0 w-20">Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`urls.${index}.icon`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-4">
                      <FormLabel className="flex-shrink-0 w-20">Icon</FormLabel>
                      <FormControl>
                        <div className="w-full flex gap-2">
                          <Image
                            width={36}
                            height={36}
                            src={getValidUrl(field.value, 'https://authjs.dev/favicon-32x32.png')}
                            alt={field.value}
                            onError={e => {
                              e.currentTarget.src = 'https://authjs.dev/favicon-32x32.png' // 设置备用图片
                            }}
                          />
                          <Input {...field} />
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`urls.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-4">
                      <FormLabel className="flex-shrink-0 w-20">描述</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pb-4">
          <Button type="button" variant="outline" onClick={() => append({ ...defaultUrl })}>
            <PlusCircle className="h-4 w-4 mr-2" />
            添加网址
          </Button>
          <BatchAdd
            onResolved={data => {
              data.forEach(item => append(item))
            }}
          >
            <Button type="button" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              批量添加网址
            </Button>
          </BatchAdd>
          <Button type="submit" className="ml-auto">
            提交
          </Button>
        </div>
      </form>
    </Form>
  )
}
