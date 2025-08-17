import { type Signin, SigninSchema } from '@hono-orpc/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
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

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const form = useForm({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      channelId: '',
    },
  });

  const navigate = useNavigate();

  const onSubmit = (data: Signin) => {
    navigate({
      to: '/chat',
      search: data,
    });
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
                  name="channelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel ID</FormLabel>
                      <FormControl>
                        <Input placeholder="general" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
