import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
    channelId: z.coerce.number().int().positive().min(1),
  }),
]);

export type Signin = z.infer<typeof signInSchema>;

function App() {
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      mode: 'join',
      sender: '',
      channelId: '',
    },
  });

  const navigate = useNavigate();

  const { mutateAsync: createChannel } = useMutation(
    orpc.chat.createChannel.mutationOptions({
      onSuccess: (data) => {
        navigate({
          to: '/chat/$channelId',
          params: { channelId: data.id.toString() },
          search: { sender: data.owner },
        });
      },
    })
  );

  const onSubmit = (data: Signin) => {
    if (data.mode === 'join') {
      navigate({
        to: '/chat/$channelId',
        params: { channelId: data.channelId.toString() },
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
              <Button className="w-full" type="submit">
                Enter
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
