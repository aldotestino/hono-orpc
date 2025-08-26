import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/')({
  component: App,
});

const signInSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('create'),
    sender: z.string().min(1),
    channelName: z.string().min(1),
  }),
  z.object({
    mode: z.literal('join'),
    sender: z.string().min(1),
    channelUuid: z.uuid(),
  }),
]);

export type Signin = z.infer<typeof signInSchema>;

function App() {
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      mode: 'join',
      sender: '',
      channelUuid: '',
    },
  });

  const mode = form.watch('mode');

  const navigate = useNavigate();

  const { mutateAsync: createChannel, isPending: isCreatingChannel } =
    useMutation(
      orpc.chat.createChannel.mutationOptions({
        onSuccess: (data) => {
          navigate({
            to: '/chat/$uuid',
            params: { uuid: data.uuid },
            search: { sender: data.owner },
          });
        },
        onError: (error) => {
          form.setError('channelName', { message: error.message });
        },
      })
    );

  const onSubmit = (data: Signin) => {
    if (data.mode === 'join') {
      navigate({
        to: '/chat/$uuid',
        params: { uuid: data.channelUuid },
        search: { sender: data.sender },
      });
    } else {
      createChannel({
        name: data.channelName,
        owner: data.sender,
      });
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <div className="flex h-full items-center gap-2">
            {/** biome-ignore lint/performance/noImgElement: no other component */}
            <img
              alt="Hono oRPC Chat"
              className="h-10 w-10"
              height={512}
              src="/logo512.png"
              width={512}
            />
            <div>
              <CardTitle>Hono oRPC Chat</CardTitle>
              <CardDescription>
                Enter in a channel to start chatting.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="space-y-4">
                <Tabs
                  className="gap-4"
                  defaultValue="join"
                  onValueChange={(value) =>
                    form.setValue('mode', value as 'join' | 'create')
                  }
                  value={mode}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="join">Join Channel</TabsTrigger>
                    <TabsTrigger value="create">Create Channel</TabsTrigger>
                  </TabsList>

                  <TabsContent value="join">
                    <FormField
                      control={form.control}
                      name="channelUuid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel UUID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123e4567-..."
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="create">
                    <FormField
                      control={form.control}
                      name="channelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="My Channel"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <FormField
                  control={form.control}
                  name="sender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                disabled={isCreatingChannel}
                type="submit"
              >
                {isCreatingChannel && (
                  <Loader className="size-4 animate-spin" />
                )}
                {mode === 'join' ? 'Join' : 'Create'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
